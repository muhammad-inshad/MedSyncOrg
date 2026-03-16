import { IAppointmentCheckoutData } from "../../../dto/appointment/appointment.dto.ts";
import { ISubscription } from "../../../models/subscription.ts";



export interface IPaymentService {
    createCheckoutSession(planId: string, hospitalId: string): Promise<{ url: string | null }>;
    createAppointmentCheckoutSession(appointmentData: IAppointmentCheckoutData, patientId: string): Promise<{ url: string | null }>;
    handleWebhook(signature: string, payload: string | Buffer): Promise<void>;
}

