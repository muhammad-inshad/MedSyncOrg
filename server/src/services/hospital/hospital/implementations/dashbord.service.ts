import { Types } from "mongoose";
import { IDoctorRepository } from "../../../../repositories/doctor/doctor.repository.interface.ts";
import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.ts";
import { IDashbord } from "../interfaces/dashbord.services.interfaces.ts";
import { IDepartmentRepository } from "../../../../repositories/hospital/department.repository.interface.ts";
import { ISpecializationRepository } from "../../../../repositories/hospital/specialization.repository.interface.ts";
import { IQualificationRepository } from "../../../../repositories/hospital/qualification.repository.interface.ts";
import { COMMENT_TYPES } from "../../../../constants/Comments/Comment.ts";
import { IWalletRepository } from "../../../../repositories/wallet/wallet.repository.interface.ts";
import { IAppointmentRepository } from "../../../../repositories/appointment/appointment.repository.interface.ts";
import { AppointmentMapper } from "../../../../mappers/appointment.mapper.ts";
import { AppointmentResponseDTO } from "../../../../dto/appointment/appointment-response.dto.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import { IHospitalDoctorConfigRepository } from "../../../../repositories/HospitalDoctorConfig/HospitalDoctorConfigRepository.interface.ts";

export class DashbordService implements IDashbord {

  constructor(
    private readonly _doctorRepo: IDoctorRepository,
    private readonly _userRepo: IUserRepository,
    private readonly _departmentRepo: IDepartmentRepository,
    private readonly _specializationRepo: ISpecializationRepository,
    private readonly _qualificationRepo: IQualificationRepository,
    private readonly _walletRepo: IWalletRepository,
    private readonly _appoiments:IAppointmentRepository,
    private readonly _appoimentmapper:AppointmentMapper,
    private readonly _hospitaldoctorcnfigRepo:IHospitalDoctorConfigRepository
  ) {}

  async getDashboardStats(hospitalId: string) {
    const totalDoctors = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId) });
    const activeDoctors = await this._doctorRepo.countActiveDoctor(hospitalId);
    const totalPatients = await this._userRepo.countDocuments();
  console.log(totalDoctors,activeDoctors,totalPatients)
    return {
      totalDoctors,
      activeDoctors,
      totalPatients,
    };
  }

  async getDoctorStatus(hospitalId: string) {
    const total = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId) });
    const active = await this._doctorRepo.countActiveDoctor(hospitalId);
    const blocked = await this._doctorRepo.countBlockedDoctor(hospitalId);
    const pending = await this._doctorRepo.countPendingDoctor(hospitalId);  
    return {
      total,
      active,     
      blocked,
      pending
    };
  };

  async getKycStats(hospitalId: string) {
    const total = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId), reviewStatus: { $in: ['pending','rejected', 'revision'] } });
    const pending = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId), reviewStatus: 'pending' });
    const rejected = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId), reviewStatus: 'rejected' });
    const revision = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId), reviewStatus: 'revision' });  
    return {
      total,
      pending,     
      rejected,
      revision
    };
  }

 async getCommonStats(
  hospitalId: string,
  type: string
): Promise<{ total: number; active: number; blocked: number }> {

  const hospitalObjectId = new Types.ObjectId(hospitalId);

  if (type === COMMENT_TYPES.PATIENT_MANAGEMENT) {
    const total = await this._userRepo.countDocuments({ hospital_id: hospitalObjectId });
    const active = await this._userRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
    const blocked = await this._userRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });

    return { total, active, blocked };
  }

  else if (type === COMMENT_TYPES.DEPARTMENT) {
    const total = await this._departmentRepo.countDocuments({ hospital_id: hospitalObjectId });
    const active = await this._departmentRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
    const blocked = await this._departmentRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });

    return { total, active, blocked };
  }

  else if (type === COMMENT_TYPES.SPECIALIZATION) {
    const total = await this._specializationRepo.countDocuments({ hospital_id: hospitalObjectId });
    const active = await this._specializationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
    const blocked = await this._specializationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });

    return { total, active, blocked };
  }

  else if (type === COMMENT_TYPES.QUALIFICATION) {
    const total = await this._qualificationRepo.countDocuments({ hospital_id: hospitalObjectId });
    const active = await this._qualificationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
    const blocked = await this._qualificationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });

    return { total, active, blocked };
  }

  return { total: 0, active: 0, blocked: 0 };
}

getWallet = async (hospitalId: string): Promise<{
  balance: number;
  totalenrnings: number;
  totalwithdrawn: number;
  transactions: {
    amount: number;
    type: 'credit' | 'debit';
    date: Date;
    description: string;
  }[];
}> => {
  const wallet = await this._walletRepo.findOne({
    ownerId: new Types.ObjectId(hospitalId),
  });

  if (!wallet) {
    return {
      balance: 0,
      totalenrnings: 0,
      totalwithdrawn: 0,
      transactions: [],
    };
  }

  return {
    balance: wallet.balance,
     totalenrnings: wallet.totalearnings || 0,
    totalwithdrawn: wallet.totalwithdrawn || 0,
    transactions: (wallet.Transaction || []).map(tx => ({
      amount: tx.amount,
      type: tx.type,
      date: tx.date,
      description: tx.type === 'credit' ? 'Earning from appointment' : 'Withdrawal',
    })),
  };
};

  withdraw = async (hospitalId: string, amount: number): Promise<{
  success: boolean;
  message: string;
}> => {
  const wallet = await this._walletRepo.findOne({ ownerId: new Types.ObjectId(hospitalId) });
  if (!wallet) {
    return { success: false, message: "Wallet not found" };
  }
  if (wallet.balance < amount) {
    return { success: false, message: "Insufficient balance" };
  }
  await this._walletRepo.debitWallet(hospitalId, amount);
  return { success: true, message: "Withdrawal successful" };
};

getReqcancalation = async (hospitalId:string): Promise<AppointmentResponseDTO[]> => {

  const appointments = await this._appoiments.findByFilter({
    cancelRequest: true,hospitalId:hospitalId
  });

  return appointments.map((appointment) =>
    this._appoimentmapper.toDTO(appointment)
  );
};

approvecancellation = async (id: string,hospitalId:string): Promise<boolean> => {

  const result = await this._appoiments.update(id, {
    cancelRequest: false,
    status: AppointmentStatus.CANCELLED
  });
  console.log(result)
const finduser = await this._appoiments.findById(id);

if (!finduser) {
  return false;
}

const patient = finduser.bookedBy as Types.ObjectId;
const doctor = finduser.doctorId;

let patientwallet = await this._walletRepo.findOne({
  ownerId: patient,
});

if (!patientwallet) {
  patientwallet = await this._walletRepo.create({
    ownerId: patient,
  });
}

const hospitalwallet = await this._walletRepo.findOne({
  ownerId: hospitalId,
});

const hospitalbalance = hospitalwallet?.balance ?? 0;

const hospitalDoctorConfig =
  await this._hospitaldoctorcnfigRepo.findByFilter({
    hospitalId,
    doctorId: doctor,
  });

const amount = hospitalDoctorConfig[0]?.doctorFee ?? 0;

if (amount <= hospitalbalance) {

  await this._walletRepo.debitWallet(
    hospitalId.toString(),
    amount
  );

  await this._walletRepo.creditWallet(
    patient.toString(),
    amount
  );
}

return true;
};

async rejectcancellation(
  id: string,
  reason: string
): Promise<boolean> {

  const result = await this._appoiments.update(id, {
    cancelRequest: false,
    rejectionReason: reason,
    status: AppointmentStatus.REJECTED,
  });

  return !!result;
}
}