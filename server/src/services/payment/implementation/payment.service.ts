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
import { IAppointment, AppointmentMode, AppointmentStatus } from "../../../models/appointment.ts";
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

        const baseAmount = plan.amount;
        const taxRate = 0.1; 
        const taxAmount = baseAmount * taxRate;
        const totalAmount = baseAmount + taxAmount;

        if (baseAmount === 0 || totalAmount === 0) {
            const startDate = new Date();
            const endDate = new Date();
            const duration = plan.duration || 1;
            const unit = plan.durationUnit || "months";
          
            if (unit === "months") endDate.setMonth(endDate.getMonth() + duration);
            else if (unit === "years") endDate.setFullYear(endDate.getFullYear() + duration);

            await this.hospitalRepository.update(hospitalId, {
                subscription: {
                    plan: plan.planName,
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
                            name: plan.planName,
                            description: plan.description || `Subscription for ${plan.planName}`,
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
 
            slotStartTime: appointmentData.slotStartTime,
            slotEndTime: appointmentData.slotEndTime,
            tokenNumber: String(appointmentData.tokenNumber),
            session: appointmentData.session || "",

            patientName: appointmentData.patientDetails.name,
            patientAge: String(appointmentData.patientDetails.age),
            patientPhone: appointmentData.patientDetails.phone,
            patientEmail: appointmentData.patientDetails.email || "",
            patientAddress: appointmentData.patientDetails.address || "",

            bloodPressure: appointmentData.bloodPressure || "",
            heartRate: appointmentData.heartRate || "",
            weight: appointmentData.weight || "",
            doctorName: appointmentData.doctorName || "",
            totalAmount: String(appointmentData.totalAmount || 0),
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
                        unit_amount: Math.round(Number(metadata.totalAmount) * 100) || 0, 
                    },
                    quantity: 1,
                },
            ],
            metadata,
            success_url: `${frontendUrl}/patient/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/patient/payment-failed`,
        });

        return this.paymentMapper.toCheckoutDTO(session.url);
    }

    async handleWebhook(signature: string, payload: string | Buffer): Promise<void> {
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                payload,
                signature,
                (process.env.STRIPE_WEBHOOK_SECRET as string).trim()
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, `Webhook Error: ${message}`);
        }

        if (event && event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;

            if (!metadata) return;

            if (metadata.type === "appointment") {
                try {
                    // CRITICAL FIX: Reconstructing the exact object required by AppointmentModel
                    const appointmentData: Partial<IAppointment> = {
                        bookedBy: new Types.ObjectId(metadata.patientId),
                        doctorId: new Types.ObjectId(metadata.doctorId),
                        hospitalId: new Types.ObjectId(metadata.hospitalId),
                        appointmentDate: new Date(metadata.appointmentDate),
                        mode: metadata.mode as AppointmentMode,
                        status: AppointmentStatus.PENDING,
                        
                        // Mapping the required strings/numbers back
                        slotStartTime: metadata.slotStartTime,
                        slotEndTime: metadata.slotEndTime,
                        tokenNumber: Number(metadata.tokenNumber),
                        session: metadata.session as "morning" | "afternoon" | "evening" | undefined,

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
                        paymentId: session.id,
                        totalAmount: Number(metadata.totalAmount)
                    };
                    await this.patientService.bookAppointment(metadata.patientId, appointmentData);
                 
                } catch (error) {
                    console.error("ERROR during webhook appointment processing:", error);
                    throw error; 
                }
                return;
            }

            // Subscription Logic...
            const { planId, hospitalId } = metadata;
            if (planId && hospitalId) {
                const plan = await this.subscriptionRepository.findById(planId);
                const hospital = await this.hospitalRepository.findById(hospitalId);

                if (plan && hospital) {
                    const duration = plan.duration || 1;
                    const unit = plan.durationUnit || "months";
                    const startDate = new Date();
                    const endDate = new Date();
                   
                    if (unit === "months") endDate.setMonth(endDate.getMonth() + duration);
                    else if (unit === "years") endDate.setFullYear(endDate.getFullYear() + duration);

                    await this.hospitalRepository.update(hospitalId, {
                        subscription: {
                            plan: plan.planName,
                            amount: plan.amount,
                            status: "active",
                            startDate,
                            endDate,
                        }
                    });

                    await this.subscriptionRepository.create({
                        planName: plan.planName,
                        amount: plan.amount,
                        status: "active",
                        startDate,
                        endDate,
                    } as Partial<ISubscription>);
                }
            }
        }
    }
}