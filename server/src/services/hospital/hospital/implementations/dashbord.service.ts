import { IDoctorRepository } from "../../../../repositories/doctor/doctor.repository.interface.ts";
import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.ts";
import { IDashbord } from "../interfaces/dashbord.services.interfaces.ts";

export class DashbordService implements IDashbord {

  constructor(
    private readonly _doctorRepo: IDoctorRepository,
    private readonly _userRepo: IUserRepository
  ) {}

  async getDashboardStats() {
    const totalDoctors = await this._doctorRepo.countDocuments();
    const activeDoctors = await this._doctorRepo.countActiveDoctor();
    const totalPatients = await this._userRepo.countDocuments();
  console.log(totalDoctors,activeDoctors,totalPatients)
    return {
      totalDoctors,
      activeDoctors,
      totalPatients,
    };
  }
}