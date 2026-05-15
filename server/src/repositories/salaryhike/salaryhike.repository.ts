import { BaseRepository } from "../IBase/BaseRepository.js";
import mongoose, { Types, FilterQuery, UpdateQuery } from "mongoose";
import { ISalaryRequest } from "../../models/SalaryRequest.model.js";
import { IsalaryRepository } from "./salaryhike.repository.interface.js";
import { IDoctor } from "../../models/doctor.model.js";

export class SalaryrequestRepository extends BaseRepository<ISalaryRequest> implements IsalaryRepository {

  async findDoctorId(
    doctorId: Types.ObjectId,
    hospitalId: Types.ObjectId
  ): Promise<boolean> {
    const existing = await this.model.findOne({
      doctorId,
      hospitalId,
      status: { $nin: ["APPROVED","REJECTED"] },
    });

    return !!existing;
  }

  async findDoctorSalaryRequests(
    filter: {
      hospital_id: string;
      status?: string;
      page: number;
      limit: number;
      search?: string;
    }
  ): Promise<{ salaryRequests: ISalaryRequest[]; totalItems: number }> {

    const query: FilterQuery<ISalaryRequest> = {
      hospitalId: new Types.ObjectId(filter.hospital_id),
    };

    if (filter.status && filter.status.toUpperCase() !== "ALL") {
      query.status = filter.status.toUpperCase();
    }

    if (filter.search) {
      
      const doctors = await mongoose.model<IDoctor>("Doctor").find({
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

  async updateSalaryRequestStatus(
    id: string,
    status: "APPROVED" | "REJECTED",
    data: { approvedAmount?: number; note: string }
  ): Promise<ISalaryRequest | null> {
    const update: UpdateQuery<ISalaryRequest> = { status };

    if (status === "APPROVED") {
      update.approvedAmount = data.approvedAmount;
      update.approvalNote = data.note;
    } else {
      update.rejectionReason = data.note;
     
    }
    return await this.model.findByIdAndUpdate(id, update, { new: true }).populate("doctorId");
  }

  async findLatestByDoctorId(doctorId: Types.ObjectId): Promise<ISalaryRequest | null> {
    return await this.model.findOne({ doctorId }).sort({ createdAt: -1 });
  }
}