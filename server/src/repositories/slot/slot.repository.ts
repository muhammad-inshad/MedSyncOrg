import { IDoctorSchedule } from "../../models/DoctorSlot.ts";
import { BaseRepository } from "../IBase/BaseRepository.ts";
import { Model } from 'mongoose';
import { ISlotRepository } from "./slot.repository.interface.ts";

export class SlotRepository extends BaseRepository<IDoctorSchedule> implements ISlotRepository {
    constructor(model: Model<IDoctorSchedule>) {
        super(model)
    }

    async findByDoctorId(doctorId: string): Promise<IDoctorSchedule[]> {
        return await this.model.find({ doctorId,isActive: true}).exec();
    }
}