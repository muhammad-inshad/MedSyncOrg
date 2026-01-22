import { UserRepository } from "../../auth/repositories/user.repository";

export class PatientService {
  constructor(private readonly userRepo: UserRepository) {}

  async getProfile(userId: string) {
    const patient = await this.userRepo.findById(userId);

    if (!patient) {
      throw { status: 404, message: "Patient not found" };
    }

    const patientObj = patient.toObject ? patient.toObject() : patient;
    delete patientObj.password;

    return patientObj;
  }
}