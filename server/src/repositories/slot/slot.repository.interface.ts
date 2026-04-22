import { IDoctorSchedule } from "../../models/DoctorSlot.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export interface ISlotRepository extends IBaseRepository<IDoctorSchedule>{
    findByDoctorId(doctorId: string): Promise<IDoctorSchedule[]>
}