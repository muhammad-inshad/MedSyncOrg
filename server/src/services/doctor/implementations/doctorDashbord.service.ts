import { Types } from "mongoose";
import { SalaryHikeRequestinterface } from "../../../dto/doctor/doctor-response.dto.ts";
import { IsalaryRepository } from "../../../repositories/salaryhike/salaryhike.repository.interface.ts";
import { IdoctorDashbord } from "../interfaces/doctorDashbord.service.interfaces.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../constants/enums.ts";
import { AppError } from "../../../errors/app.error.ts";
import { IDoctorRepository } from "../../../repositories/doctor/doctor.repository.interface.ts";
import { ISalaryRequest } from "../../../models/SalaryRequest.model.ts";



export class DoctorDashboardService implements IdoctorDashbord{
    constructor(private readonly _repository:IsalaryRepository,private readonly _doctorRepo:IDoctorRepository){}
    async salaryincreserequest(data:SalaryHikeRequestinterface):Promise<boolean>{
   
      const payload = {
    doctorId: new Types.ObjectId(data.doctorId),
    hospitalId: new Types.ObjectId(data.hospitalId),

    currentAmount: Number(data.currentSalary),
    requestedAmount: Number(data.requestedSalary),

    reason: data.reason,
  };
  const dublicate=await this._repository.findDoctorId(payload.doctorId,payload.hospitalId)
    if(dublicate){
 throw new AppError("Under review, please wait", HttpStatusCode.CONFLICT);
    }
    const res = await this._repository.create(payload);
    return res !== null;
    }

    async getsalaryincreserequest(doctorId: string): Promise<ISalaryRequest | null> {
        const result= await this._repository.findLatestByDoctorId(new Types.ObjectId(doctorId));
        return result;
    }
}