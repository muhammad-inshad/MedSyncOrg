import { IDoctorSchedule } from "../../models/DoctorSlot.js";
import { BaseRepository } from "../IBase/BaseRepository.js";
import mongoose, { Model } from 'mongoose';
import { ISlotRepository } from "./slot.repository.interface.js";

export class SlotRepository extends BaseRepository<IDoctorSchedule> implements ISlotRepository {
    constructor(model: Model<IDoctorSchedule>) {
        super(model)
    }

    async findByDoctorId(doctorId: string): Promise<IDoctorSchedule[]> {
        return await this.model.find({ doctorId,isActive: true}).exec();
    }

    async findExistingSchedule(doctorId: string,daysOfWeek: number[]):Promise<string[]|null>{
       const result = await this.model.aggregate([
    {
      $match: {
        doctorId: new mongoose.Types.ObjectId(doctorId),
        daysOfWeek: { $in: daysOfWeek },
      },
    },
    { $project: { _id: 0, session: 1 } },
  ]);
  
  const sessions = result.map(item => item.session);
  return sessions;
    }


}