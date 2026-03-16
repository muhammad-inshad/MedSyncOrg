import Stripe from "stripe";
import { Types } from "mongoose";
import stripe from "../../../config/stripe.ts";
import { IPaymentService } from "../interfaces/payment.service.interface.ts";
import { ISubscriptionRepository } from "../../../repositories/superAdmin/subscription/interfaces/subscription.repository.interface.ts";
import { IHospitalRepository } from "../../../repositories/hospital/hospital.repository.interface.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../constants/enums.ts";
import { ISubscription } from "../../../models/subscription.ts";

export class PaymentService implements IPaymentService {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly hospitalRepository: IHospitalRepository
    ) {}

    async createCheckoutSession(planId: string, hospitalId: string): Promise<{ url: string | null }> {
        const plan = await this.subscriptionRepository.findById(planId);
        if (!plan) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Subscription plan not found");
        }

          const baseAmount = plan.price || plan.amount;
  const taxRate = 0.1; 
  const taxAmount = baseAmount * taxRate;
  const totalAmount = baseAmount + taxAmount;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: plan.planName || plan.plan,
                            description: plan.description || `Subscription for ${plan.planName || plan.plan}`,
                        },
                        unit_amount: Math.round(totalAmount * 100), 
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                planId: planId,
                hospitalId: hospitalId,
            },
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/hospital/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/hospital/subscription`,
        });

        return { url: session.url };
    }

    async handleWebhook(signature: string, payload: string | Buffer): Promise<void> {
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET as string
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, `Webhook Error: ${message}`);
        }

        if (event && event.type === "checkout.session.completed") {
            console.log("Processing checkout.session.completed event");
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;

            if (!metadata || !metadata.planId || !metadata.hospitalId) {
                console.error("Missing metadata in Stripe session", session.id);
                return;
            }

            const { planId, hospitalId } = metadata;
            console.log(`PlanId: ${planId}, HospitalId: ${hospitalId}`);

            const plan = await this.subscriptionRepository.findById(planId);
            const hospital = await this.hospitalRepository.findById(hospitalId);

            if (!plan) console.error(`Plan not found for ID: ${planId}`);
            if (!hospital) console.error(`Hospital not found for ID: ${hospitalId}`);

            if (plan && hospital) {
                console.log("Plan and Hospital found, updating records...");
                const duration = plan.duration || 1;
                const unit = plan.durationUnit || "months";
                
                const startDate = new Date();
                const endDate = new Date();
                if (unit === "days") endDate.setDate(endDate.getDate() + duration);
                else if (unit === "months") endDate.setMonth(endDate.getMonth() + duration);
                else if (unit === "years") endDate.setFullYear(endDate.getFullYear() + duration);

                try {
                    await this.hospitalRepository.update(hospitalId, {
                        subscription: {
                            plan: plan.plan,
                            amount: plan.price || plan.amount,
                            status: "active",
                            startDate,
                            endDate,
                        }
                    });
                    console.log("Hospital subscription updated successfully");

                    // Also update the subscription model for tracking
                    await this.subscriptionRepository.create({
                        hospitalId: hospital._id as Types.ObjectId,
                        plan: plan.plan,
                        planName: plan.planName,
                        amount: plan.price || plan.amount,
                        status: "active",
                        startDate,
                        endDate,
                        paymentId: session.id,
                        paymentMethod: "stripe",
                        limits: plan.limits
                    } as Partial<ISubscription>);
                    console.log("Subscription record created successfully");
                } catch (dbError) {
                    console.error("Database error during webhook processing:", dbError);
                }
            }
        } else {
            console.log(`Event type ${event?.type} ignored`);
        }
    }
}
