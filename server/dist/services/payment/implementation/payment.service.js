import { Types } from "mongoose";
import stripe from "../../../config/stripe.js";
import { ApiResponse } from "../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../constants/enums.js";
import { AppointmentStatus } from "../../../models/appointment.js";
import logger from "../../../utils/logger.js";
export class PaymentService {
    constructor(subscriptionRepository, hospitalRepository, patientService, paymentMapper, _WalletRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.hospitalRepository = hospitalRepository;
        this.patientService = patientService;
        this.paymentMapper = paymentMapper;
        this._WalletRepository = _WalletRepository;
    }
    async createCheckoutSession(planId, hospitalId) {
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
            if (unit === "months")
                endDate.setMonth(endDate.getMonth() + duration);
            else if (unit === "years")
                endDate.setFullYear(endDate.getFullYear() + duration);
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
        logger.info(`[PaymentService] Creating Hospital Subscription Stripe session for plan: ${plan.planName}`);
        try {
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
        catch (error) {
            logger.error(`[PaymentService] Hospital subscription session creation failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async createAppointmentCheckoutSession(appointmentData, patientId) {
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
        try {
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
        catch (error) {
            logger.error(`[PaymentService] Stripe session creation failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async handleWebhook(signature, payload) {
        let event;
        try {
            event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET.trim());
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, `Webhook Error: ${message}`);
        }
        if (event && event.type === "checkout.session.completed") {
            const session = event.data.object;
            const metadata = session.metadata;
            if (!metadata)
                return;
            if (metadata.type === "appointment") {
                logger.info(`[PaymentService.handleWebhook] Processing appointment for patient: ${metadata.patientId}`);
                try {
                    // CRITICAL FIX: Reconstructing the exact object required by AppointmentModel
                    const appointmentData = {
                        bookedBy: new Types.ObjectId(metadata.patientId),
                        doctorId: new Types.ObjectId(metadata.doctorId),
                        hospitalId: new Types.ObjectId(metadata.hospitalId),
                        appointmentDate: new Date(metadata.appointmentDate),
                        mode: metadata.mode,
                        status: AppointmentStatus.PENDING,
                        // Mapping the required strings/numbers back
                        slotStartTime: metadata.slotStartTime,
                        slotEndTime: metadata.slotEndTime,
                        tokenNumber: Number(metadata.tokenNumber),
                        session: metadata.session,
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
                    logger.info(`[PaymentService.handleWebhook] Appointment successfully processed via webhook`);
                }
                catch (error) {
                    logger.error(`[PaymentService.handleWebhook] ERROR during webhook appointment processing: ${error instanceof Error ? error.message : String(error)}`);
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
                    if (unit === "months")
                        endDate.setMonth(endDate.getMonth() + duration);
                    else if (unit === "years")
                        endDate.setFullYear(endDate.getFullYear() + duration);
                    await this.hospitalRepository.update(hospitalId, {
                        subscription: {
                            plan: plan.planName,
                            amount: plan.amount,
                            status: "active",
                            startDate,
                            endDate,
                        }
                    });
                    const superAdminId = process.env.SUPER_ADMIN_ID;
                    await this._WalletRepository.creditWallet(superAdminId, plan.amount);
                    await this.subscriptionRepository.create({
                        planName: plan.planName,
                        amount: plan.amount,
                        status: "active",
                        startDate,
                        endDate,
                    });
                }
            }
        }
    }
}
