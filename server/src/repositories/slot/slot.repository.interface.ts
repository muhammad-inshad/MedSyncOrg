import { IDoctorSchedule } from "../../models/DoctorSlot.js";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.js";

export interface ISlotRepository extends IBaseRepository<IDoctorSchedule>{
    findByDoctorId(doctorId: string): Promise<IDoctorSchedule[]>
    findExistingSchedule(doctorId: string,daysOfWeek: number[],session: string): Promise<string[]| null>;
}