import { IAppointment } from "../../models/appointment.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export interface IAppointmentRepository extends IBaseRepository<IAppointment> {
    findByDoctorAndDate(doctorId: string, date: Date, options?: { page: number; limit: number }): Promise<{ appointments: IAppointment[]; total: number }>;
    countByDoctorAndDate(doctorId: string, date: Date): Promise<number>;
    findUpcomingAppointments(
        doctorId: string,
        options: {
            page: number;
            limit: number;
            search?: string;
            date?: Date
        }
    ): Promise<{ appointments: IAppointment[]; total: number }>;
    findDuplicate(
        doctorId: string,
        date: Date,
        patient: { name: string; age: number; email?: string }
    ): Promise<IAppointment | null>;
    findPatientAppointments(
        patientId: string,
        options: {
            page: number;
            limit: number;
            search?: string;
        }
    ): Promise<{ appointments: IAppointment[]; total: number }>;
        findLiveToken(doctorId: string): Promise<IAppointment | null>;
    findDoctorByPatientToday(patientId: string): Promise<string | null>;
    findPatientAppointmentsToday(patientId: string): Promise<IAppointment[]>;
    findByPaymentId(paymentId: string): Promise<IAppointment | null>;
    getPatientEmail(appointmentId: string): Promise<string | null>;
    
}
