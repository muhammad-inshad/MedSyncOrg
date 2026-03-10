import { IAppointment } from "../../models/appointment.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export interface IAppointmentRepository extends IBaseRepository<IAppointment> {
    findByDoctorAndDate(doctorId: string, date: Date): Promise<IAppointment[]>;
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
}
