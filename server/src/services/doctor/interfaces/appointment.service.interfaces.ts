import { IPrescriptionData } from "../../../dto/appointment/appointment.dto.ts";
import { IAppointment, AppointmentStatus } from "../../../models/appointment.ts";

export interface IAppointments {
    getUpcomingAppointments(
        doctorId: string,
        options: {
            page: number;
            limit: number;
            search?: string;
            date?: string;
        }
    ): Promise<{ appointments: IAppointment[]; total: number }>;
    getTodayConsultations(doctorId: string, options?: { page: number; limit: number }): Promise<{ appointments: IAppointment[]; total: number }>;
    updateStatus(appointmentId: string, status: AppointmentStatus): Promise<IAppointment | null>;
    savePrescription(appointmentId: string, prescriptionData: IPrescriptionData): Promise<IAppointment | null>;
   
}