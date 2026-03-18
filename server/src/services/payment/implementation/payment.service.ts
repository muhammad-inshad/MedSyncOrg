import Stripe from "stripe";
import { Types } from "mongoose";
import stripe from "../../../config/stripe.ts";
import { IPaymentService } from "../interfaces/payment.service.interface.ts";
import { ISubscriptionRepository } from "../../../repositories/superAdmin/subscription/interfaces/subscription.repository.interface.ts";
import { IHospitalRepository } from "../../../repositories/hospital/hospital.repository.interface.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../constants/enums.ts";
import { ISubscription } from "../../../models/subscription.ts";

import { IPatientService } from "../../patient/interfaces/patient.service.interfaces.ts";
import { IAppointmentCheckoutData } from "../../../dto/appointment/appointment.dto.ts";
import { IAppointment, AppointmentMode } from "../../../models/appointment.ts";
import { CheckoutResponseDTO } from "../../../dto/payment/checkout-response.dto.ts";
import { PaymentMapper } from "../../../mappers/payment.mapper.ts";

export class PaymentService implements IPaymentService {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly hospitalRepository: IHospitalRepository,
        private readonly patientService: IPatientService,
        private readonly paymentMapper: PaymentMapper
    ) {}

    async createCheckoutSession(planId: string, hospitalId: string): Promise<CheckoutResponseDTO> {
        const plan = await this.subscriptionRepository.findById(planId);
        if (!plan) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Subscription plan not found");
        }

          const baseAmount = plan.price || plan.amount;
  const taxRate = 0.1; 
  const taxAmount = baseAmount * taxRate;
  const totalAmount = baseAmount + taxAmount;

        if (baseAmount === 0 || totalAmount === 0) {
            const startDate = new Date();
            const endDate = new Date();
            const duration = plan.duration || 1;
            const unit = plan.durationUnit || "months";
            
            if (unit === "days") endDate.setDate(endDate.getDate() + duration);
            else if (unit === "months") endDate.setMonth(endDate.getMonth() + duration);
            else if (unit === "years") endDate.setFullYear(endDate.getFullYear() + duration);

            await this.hospitalRepository.update(hospitalId, {
                subscription: {
                    plan: plan.plan,
                    amount: 0,
                    status: "active",
                    startDate,
                    endDate,
                }
            });

            return { url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/hospital/payment-success?plan=free` };
        }

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


    return this.paymentMapper.toCheckoutDTO(session.url);
}

    async createAppointmentCheckoutSession(appointmentData: IAppointmentCheckoutData, patientId: string): Promise<CheckoutResponseDTO> {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        
const metadata = {
  type: "appointment",
  patientId: String(patientId),
  doctorId: String(appointmentData.doctorId),
  hospitalId: String(appointmentData.hospitalId),
  appointmentDate: String(appointmentData.appointmentDate),
  mode: appointmentData.mode,

  patientName: appointmentData.patientDetails.name,
  patientAge: String(appointmentData.patientDetails.age),
  patientPhone: appointmentData.patientDetails.phone,
  patientEmail: appointmentData.patientDetails.email || "",
  patientAddress: appointmentData.patientDetails.address || "",

  bloodPressure: appointmentData.bloodPressure || "",
  heartRate: appointmentData.heartRate || "",
  weight: appointmentData.weight || "",

  doctorName: appointmentData.doctorName || ""
};

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `Appointment with Dr. ${appointmentData.doctorName || 'Doctor'}`,
                            description: `Appointment on ${new Date(appointmentData.appointmentDate).toLocaleDateString()}`,
                        },
                        unit_amount: 50000,
                    },
                    quantity: 1,
                },
            ],
            metadata,
            success_url: `${frontendUrl}/patient/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/patient/appointment/${appointmentData.doctorId}`,
        });

        return this.paymentMapper.toCheckoutDTO(session.url);
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

            if (!metadata) {
                console.error("Missing metadata in Stripe session", session.id);
                return;
            }

            if (metadata.type === "appointment") {
                const { patientId } = metadata;
                if (!patientId) {
                    console.error("Missing critical patientId in metadata");
                    return;
                }
        
                try {
                    const appointmentData: Partial<IAppointment> = {
                        doctorId: new Types.ObjectId(metadata.doctorId),
                        hospitalId: new Types.ObjectId(metadata.hospitalId),
                        appointmentDate: new Date(metadata.appointmentDate),
                        mode: metadata.mode as AppointmentMode,
                        patientDetails: {
                            name: metadata.patientName,
                            age: Number(metadata.patientAge),
                            phone: metadata.patientPhone,
                            email: metadata.patientEmail,
                            address: metadata.patientAddress
                        },
                        bloodPressure: metadata.bloodPressure,
                        heartRate: metadata.heartRate,
                        weight: metadata.weight,
                    };

                    console.log("Reconstructed Appointment Data from Metadata:", JSON.stringify(appointmentData, null, 2));
                    await this.patientService.bookAppointment(patientId, appointmentData);
                } catch (error) {
                    console.error("ERROR during webhook appointment processing:", error);
                    throw error; 
                }
                return;
            }


            const { planId, hospitalId } = metadata;
            if (!planId || !hospitalId) {
                console.error("Missing planId or hospitalId in Stripe session metadata");
                return;
            }

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

                    const subscriptionData: Partial<ISubscription> = {
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
                    };
                    await this.subscriptionRepository.create(subscriptionData);
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
