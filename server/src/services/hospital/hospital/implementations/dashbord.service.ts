import { Types } from "mongoose";
import { IDoctorRepository } from "../../../../repositories/doctor/doctor.repository.interface.ts";
import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.ts";
import { IDashbord } from "../interfaces/dashbord.services.interfaces.ts";
import { IDepartment } from "../../../../models/department.model.ts";
import { IDepartmentRepository } from "../../../../repositories/hospital/department.repository.interface.ts";
import { ISpecializationRepository } from "../../../../repositories/hospital/specialization.repository.interface.ts";
import { IQualificationRepository } from "../../../../repositories/hospital/qualification.repository.interface.ts";
import { COMMENT_TYPES } from "../../../../constants/Comments/Comment.ts";

export class DashbordService implements IDashbord {

  constructor(
    private readonly _doctorRepo: IDoctorRepository,
    private readonly _userRepo: IUserRepository,
    private readonly _departmentRepo: IDepartmentRepository,
    private readonly _specializationRepo: ISpecializationRepository,
    private readonly _qualificationRepo: IQualificationRepository
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
}