import { IAppointmentCheckoutData } from "../../../dto/appointment/appointment.dto.ts";
import { CheckoutResponseDTO } from "../../../dto/payment/checkout-response.dto.ts";

export interface IPaymentService {
    createCheckoutSession(planId: string, hospitalId: string, upgradeType?: "upgrade"): Promise<CheckoutResponseDTO>;
    createAppointmentCheckoutSession(appointmentData: IAppointmentCheckoutData, patientId: string): Promise<CheckoutResponseDTO>;
    handleWebhook(signature: string, payload: string | Buffer): Promise<void>;
}

