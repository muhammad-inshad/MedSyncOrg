import { BaseRepository } from "../IBase/BaseRepository.js";
import mongoose, { Types } from "mongoose";
export class SalaryrequestRepository extends BaseRepository {
    async findDoctorId(doctorId, hospitalId) {
        const existing = await this.model.findOne({
            doctorId,
            hospitalId,
            status: { $nin: ["APPROVED", "REJECTED"] },
        });
        return !!existing;
    }
    async findDoctorSalaryRequests(filter) {
        const query = {
            hospitalId: new Types.ObjectId(filter.hospital_id),
        };
        if (filter.status && filter.status.toUpperCase() !== "ALL") {
            query.status = filter.status.toUpperCase();
        }
        if (filter.search) {
            const doctors = await mongoose.model("Doctor").find({
                name: { $regex: filter.search, $options: "i" }
            }).select("_id");
            query.doctorId = { $in: doctors.map(d => d._id) };
        }
        const skip = (filter.page - 1) * filter.limit;
        const totalItems = await this.model.countDocuments(query);
        const salaryRequests = await this.model
            .find(query)
            .populate("doctorId")
            .skip(skip)
            .limit(filter.limit)
            .sort({ createdAt: -1 });
        return { salaryRequests, totalItems };
    }
    async updateSalaryRequestStatus(id, status, data) {
        const update = { status };
        if (status === "APPROVED") {
            update.approvedAmount = data.approvedAmount;
            update.approvalNote = data.note;
        }
        else {
            update.rejectionReason = data.note;
        }
        return await this.model.findByIdAndUpdate(id, update, { new: true }).populate("doctorId");
    }
    async findLatestByDoctorId(doctorId) {
        return await this.model.findOne({ doctorId }).sort({ createdAt: -1 });
    }
}
