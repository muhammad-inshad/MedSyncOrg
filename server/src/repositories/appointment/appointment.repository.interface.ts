import { IAppointment } from "../../models/appointment.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export interface IAppointmentRepository extends IBaseRepository<IAppointment> {
    findByDoctorAndDate(doctorId: string, date: Date): Promise<IAppointment[]>;
    countByDoctorAndDate(doctorId: string, date: Date): Promise<number>;
}
