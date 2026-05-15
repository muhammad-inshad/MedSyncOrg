import { AppointmentResponseDTO } from "../../../dto/appointment/appointment-response.dto.js";
import { IPrescriptionData } from "../../../dto/appointment/appointment.dto.js";
import { PrescriptionResponseDTO } from "../../../dto/patient/prescription-response.dto.js";
import { AppointmentStatus } from "../../../models/appointment.js";

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
    savePrescription(appointmentId: string, prescriptionData: IPrescriptionData): Promise<PrescriptionResponseDTO | null>;
   
}