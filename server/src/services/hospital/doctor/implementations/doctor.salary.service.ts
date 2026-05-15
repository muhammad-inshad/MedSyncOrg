import { ISalaryRequest } from "../../../../models/SalaryRequest.model.js";
import { IsalaryRepository } from "../../../../repositories/salaryhike/salaryhike.repository.interface.js";
import { IDoctorSalaryService } from "../interfaces/doctor.salary.service.interface.js";
import { IDoctorRepository } from "../../../../repositories/doctor/doctor.repository.interface.js";
import { IHospitalDoctorConfigRepository } from "../../../../repositories/HospitalDoctorConfig/HospitalDoctorConfigRepository.interface.js";
import { Types } from "mongoose";

export class DoctorSalaryservice implements IDoctorSalaryService {
    constructor(
      private readonly _IsalaryRepository: IsalaryRepository,
      private readonly _IDoctorRepository: IDoctorRepository,
      private readonly _IHospitalDoctorConfigRepository: IHospitalDoctorConfigRepository
    ) {}

   async getDoctorSalaryRequests(hospital_id: string, page?: number, limit?: number, search?: string, status?: string): Promise<{ data: ISalaryRequest[]; total: number; totalPages: number }> {
       const { salaryRequests, totalItems } = await this._IsalaryRepository.findDoctorSalaryRequests({
         hospital_id: hospital_id,
         page: page||1,
         limit: limit||5,
         search: search || "",
         status: status || "ALL",
       });
       const totalPages = Math.ceil(totalItems / (limit || 5));
       return {
         data: salaryRequests,
         total: totalItems,
         totalPages: totalPages
       };
    }

   async updateSalaryRequestStatus(
  id: string,
  hospital_id: string,
  status: "APPROVED" | "REJECTED",
  data: { approvedAmount?: number; note: string; hospitalCommission?: number, doctorId?: string }
): Promise<ISalaryRequest | null> {

  if (status === "APPROVED") {

    const doctorObjectId = new Types.ObjectId(data.doctorId);
    const hospitalObjectId = new Types.ObjectId(hospital_id);

    const existingConfig =
      await this._IHospitalDoctorConfigRepository.findOne({
        doctorId: doctorObjectId,
        hospitalId: hospitalObjectId,
      });

    if (existingConfig) {
      await this._IHospitalDoctorConfigRepository.update(
        existingConfig._id.toString(),
        {
          hospitalCommission: data.hospitalCommission,
          doctorFee: data.approvedAmount,
        }
      );

    } else {
      await this._IHospitalDoctorConfigRepository.create({
        doctorId: doctorObjectId,
        hospitalId: hospitalObjectId,
        hospitalCommission: data.hospitalCommission ?? 0,
        doctorFee: data.approvedAmount ?? 0,
      });
    }
  }

  return await this._IsalaryRepository.updateSalaryRequestStatus(
    id,
    status,
    data
  );
}
}