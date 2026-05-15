import { BaseRepository } from "../IBase/BaseRepository.js";
import mongoose, { Types } from "mongoose";
export class DoctorRepository extends BaseRepository {
    async countByDepartment(hospitalId, departmentId) {
        const deptObjectId = new mongoose.Types.ObjectId(departmentId);
        return await this.model.countDocuments({
            hospital_id: hospitalId,
            isActive: true,
            reviewStatus: "approved",
            $or: [
                { department: departmentId },
                ...(deptObjectId ? [{ department_id: deptObjectId }] : []),
            ],
        }).exec();
    }
    async countActiveDoctor(hospitalId) {
        console.log("hospitalId:", hospitalId);
        console.log("typeof:", typeof hospitalId);
        console.log("hospitalId length:", hospitalId?.length);
        return this.model.countDocuments({
            hospital_id: new Types.ObjectId(hospitalId),
            isActive: true,
        }).exec();
    }
    async countBlockedDoctor(hospitalId) {
        return this.model.countDocuments({
            hospital_id: new Types.ObjectId(hospitalId),
            isActive: false,
        }).exec();
    }
    async countPendingDoctor(hospitalId) {
        return this.model.countDocuments({
            hospital_id: new Types.ObjectId(hospitalId),
            reviewStatus: "pending",
        }).exec();
    }
    async updateDoctorSalary(doctorId, salary) {
        await this.model.findByIdAndUpdate(doctorId, { salary });
    }
    async findDoctorFromHospitalCount() {
    }
}
