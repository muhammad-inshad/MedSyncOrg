import { AppointmentResponseDTO } from "../../../dto/appointment/appointment-response.dto.ts";
import { IPrescriptionData } from "../../../dto/appointment/appointment.dto.ts";
import { AppointmentStatus } from "../../../models/appointment.ts";

export interface IAppointments {
    getUpcomingAppointments(
        doctorId: string,
        options: {
            page: number;
            limit: number;
            search?: string;
            date?: string;
        }
    ): Promise<{ appointments: AppointmentResponseDTO[]; total: number }>;
    getTodayConsultations(doctorId: string, options?: { page: number; limit: number,shift:string }): Promise<{ appointments: AppointmentResponseDTO[]; total: number }>;
    updateStatus(appointmentId: string, status: AppointmentStatus): Promise<AppointmentResponseDTO | null>;
    savePrescription(appointmentId: string, prescriptionData: IPrescriptionData): Promise<AppointmentResponseDTO | null>;
   
}