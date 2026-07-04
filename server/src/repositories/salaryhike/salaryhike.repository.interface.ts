import { Types } from "mongoose";
import { ISalaryRequest } from "../../models/SalaryRequest.model.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export interface IsalaryRepository extends IBaseRepository<ISalaryRequest>{
  findDoctorId(doctorId: Types.ObjectId, hospitalId: Types.ObjectId): Promise<boolean>;
  findDoctorSalaryRequests(filter: { 
    hospital_id: string; 
    page: number; 
    limit: number; 
    search: string; 
    status: string 
  }): Promise<{ salaryRequests: ISalaryRequest[]; totalItems: number }>;
  updateSalaryRequestStatus(
    id: string, 
    status: "APPROVED" | "REJECTED", 
    data: { approvedAmount?: number; note: string }
  ): Promise<ISalaryRequest | null>;
  findLatestByDoctorId(doctorId: Types.ObjectId): Promise<ISalaryRequest | null>;
}