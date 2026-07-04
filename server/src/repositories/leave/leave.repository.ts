import { FilterQuery, UpdateQuery, Types } from "mongoose";
import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IDoctorLeave } from "../../models/doctorLeave.model.ts";
import { ILeaveRepository } from "./leave.repository.interface.ts";
import DoctorLeaveModel from "../../models/doctorLeave.model.ts";
import { DoctorModel, IDoctor } from "../../models/doctor.model.ts";

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

        const filter: FilterQuery<IDoctorLeave> = { 
            doctorId: new Types.ObjectId(doctorId) 
        };

        if (startDate) {
            const startOfDay = new Date(startDate);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = endDate ? new Date(endDate) : new Date(startDate);
            endOfDay.setHours(23, 59, 59, 999);

            // Overlap logic: Leave overlaps with requested range if:
            // (LeaveStartDate <= EndOfRange) AND (LeaveEndDate >= StartOfRange)
            filter.$and = [
                { startDate: { $lte: endOfDay } },
                { endDate: { $gte: startOfDay } }
            ];
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

    async findHospitalLeaves(options: {
        hospitalId: string;
        page: number;
        limit: number;
        search?: string;
        date?: Date;
    }): Promise<{ data: IDoctorLeave[]; total: number; page: number; limit: number }> {
        const { hospitalId, page, limit, search, date } = options;
        const skip = (page - 1) * limit;

        const doctorFilter: FilterQuery<IDoctor> = { hospital_id: new Types.ObjectId(hospitalId) };
        if (search) {
            doctorFilter.name = { $regex: search, $options: "i" };
        }

        const doctors = await DoctorModel.find(doctorFilter).select("_id").exec();
        const doctorIds = doctors.map(d => d._id);

        const leaveFilter: FilterQuery<IDoctorLeave> = { doctorId: { $in: doctorIds } };

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            leaveFilter.$and = [
                { startDate: { $lte: endOfDay } },
                { endDate: { $gte: startOfDay } }
            ];
        }

        const [data, total] = await Promise.all([
            this.model.find(leaveFilter)
                .populate("doctorId", "name email profileImage specialization department")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments(leaveFilter).exec()
        ]);

        return { data, total, page, limit };
    }

    async updateStatus(id: string, status: 'approved' | 'rejected', rejectedReason?: string): Promise<IDoctorLeave | null> {
        const update: UpdateQuery<IDoctorLeave> = { status };
        if (status === 'rejected' && rejectedReason) {
            update.rejectedReson = rejectedReason;
        }
        return await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    }


}
