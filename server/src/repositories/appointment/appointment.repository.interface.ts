import { ClientSession } from "mongoose";
import { IAppointment } from "../../models/appointment.js";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.js";

export interface IAppointmentRepository extends IBaseRepository<IAppointment> {
    findByDoctorAndDate(doctorId: string, date: string | Date , options?: { page: number; limit: number }): Promise<{ appointments: IAppointment[]; total: number }>;
    countByDoctorAndDate(doctorId: string, date: Date): Promise<number>;
    findUpcomingAppointments(
        doctorId: string,
        options: {
            page: number;
            limit: number;
            search?: string;
            date?: Date;
                  
        }
    ): Promise<{ appointments: IAppointment[]; total: number }>;
    findDuplicate(
        doctorId: string,
        date: Date,
        patient: { name: string; age: number; email?: string },
            session?: ClientSession   
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
    findPatientAppointmentsToday(patientId: string, date?: string): Promise<IAppointment[]>;
    findByPaymentId(paymentId: string): Promise<IAppointment | null>;
    getPatientEmail(appointmentId: string): Promise<string | null>;
    findtodayconseltation( doctorId: string,
  dateString: string,
  options?: { page: number; limit: number,shift:string}):Promise<{ appointments: IAppointment[]; total: number }> 
    countByDoctorDateAndSession(doctorId: string, date: Date, session: string, mongoSession?: ClientSession): Promise<number>;

}
