import { BaseRepository } from "../IBase/BaseRepository.js";
import mongoose from 'mongoose';
export class SlotRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
    async findByDoctorId(doctorId) {
        return await this.model.find({ doctorId, isActive: true }).exec();
    }
    async findExistingSchedule(doctorId, daysOfWeek) {
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
