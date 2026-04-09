import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IDoctor } from "../../models/doctor.model.ts";
import { IDoctorRepository } from "./doctor.repository.interface.ts";
import { Types } from "mongoose";


export class DoctorRepository extends BaseRepository<IDoctor> implements IDoctorRepository {
    async countByDepartment(hospitalId: string, departmentId: string): Promise<number> {
        return await this.model.countDocuments({
            hospital_id: hospitalId,
            department: departmentId,
            isActive: true,
            reviewStatus: "approved"
        }).exec();
    }

async countActiveDoctor(hospitalId: string): Promise<number> {
    console.log("hospitalId:", hospitalId);
  console.log("typeof:", typeof hospitalId);
  console.log("hospitalId length:", hospitalId?.length);
  return this.model.countDocuments({
    hospital_id: new Types.ObjectId(hospitalId),
    isActive: true,
  }).exec();
}

async countBlockedDoctor(hospitalId: string): Promise<number> {
  return this.model.countDocuments({
    hospital_id: new Types.ObjectId(hospitalId),
    isActive: false,
  }).exec();
}

async countPendingDoctor(hospitalId: string): Promise<number> {
  return this.model.countDocuments({
    hospital_id: new Types.ObjectId(hospitalId),
    reviewStatus: "pending",
  }).exec();
}
}