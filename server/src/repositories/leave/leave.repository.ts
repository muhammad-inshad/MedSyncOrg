import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IDoctorLeave } from "../../models/doctorLeave.model.ts";
import { ILeaveRepository } from "./leave.repository.interface.ts";
import DoctorLeaveModel from "../../models/doctorLeave.model.ts";

export class LeaveRepository extends BaseRepository<IDoctorLeave> implements ILeaveRepository {
    constructor() {
        super(DoctorLeaveModel);
    }

    async findDoctorLeaves(options: {
        doctorId: string;
        page: number;
        limit: number;
        startDate?: Date;
        endDate?: Date
    }): Promise<{ data: IDoctorLeave[]; total: number; page: number; limit: number }> {
        const { doctorId, page, limit, startDate, endDate } = options;
        const skip = (page - 1) * limit;

        const filter: any = { doctorId };

        if (startDate && endDate) {
            filter.startDate = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
            filter.startDate = { $gte: startDate };
        }

        const [data, total] = await Promise.all([
            this.model.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments(filter).exec()
        ]);

        return { data, total, page, limit };
    }
}
