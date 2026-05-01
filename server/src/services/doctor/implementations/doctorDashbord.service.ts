import { Types } from "mongoose";
import { SalaryHikeRequestinterface } from "../../../dto/doctor/doctor-response.dto.ts";
import { IsalaryRepository } from "../../../repositories/salaryhike/salaryhike.repository.interface.ts";
import { IdoctorDashbord } from "../interfaces/doctorDashbord.service.interfaces.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../constants/enums.ts";
import { AppError } from "../../../errors/app.error.ts";
import { IDoctorRepository } from "../../../repositories/doctor/doctor.repository.interface.ts";
import { ISalaryRequest } from "../../../models/SalaryRequest.model.ts";
import { IWalletRepository } from "../../../repositories/wallet/wallet.repository.interface.ts";


export class DoctorDashboardService implements IdoctorDashbord{
    constructor(private readonly _repository:IsalaryRepository,private readonly _doctorRepo:IDoctorRepository,private readonly _walletRepo: IWalletRepository){}
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

  async getwallet(doctorId: string): Promise<{ balance: number ,totalenrnings:number,totalwithdrawn:number,Transaction?: {
    amount: number;
    type: "credit" | "debit";
    date: string;
  }[]}> {

  const doctor = await this._walletRepo.findByFilter({
    ownerId: new Types.ObjectId(doctorId)
  });

  if (!doctor || doctor.length === 0) {
    throw new AppError("Doctor not found", HttpStatusCode.NOT_FOUND);
  }


  return {
    balance: doctor[0].balance,
    totalenrnings: doctor[0].totalearnings || 0,
    totalwithdrawn: doctor[0].totalwithdrawn || 0,
    Transaction: (doctor[0].Transaction || []).map(tx => ({
      amount: tx.amount,
      type: tx.type,
      date: tx.date.toISOString(),
    })),
  };
}

async withdraw(doctorId: string, amount: number): Promise<boolean> {
  const doctor = await this._walletRepo.findByFilter({
    ownerId: new Types.ObjectId(doctorId)
  });

  if (!doctor || doctor.length === 0) {
    throw new AppError("Doctor not found", HttpStatusCode.NOT_FOUND);
  }

  const wallet = doctor[0];

  if (wallet.balance < amount) {
    throw new AppError("Insufficient balance", HttpStatusCode.BAD_REQUEST);
  }

  wallet.balance -= amount;
  wallet.totalwithdrawn = (wallet.totalwithdrawn || 0) + amount;

  wallet.Transaction = wallet.Transaction || [];
  wallet.Transaction.push({
    amount: amount,
    type: "debit",
    date: new Date()
  });

  await wallet.save(); 

  return true;
}
}