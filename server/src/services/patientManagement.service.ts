import { AdminRepository } from "../repositories/admin/admin.repository.ts";
import { TokenService } from "./token.service.ts";
import cloudinary from "../config/cloudinary.ts";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.ts";
import { UserRepository } from "../repositories/patient/user.repository.ts";
import { IPatient } from "../models/Patient.model.ts";
import bcrypt from "bcryptjs";
export class patientManagementService {
  constructor(private readonly adminRepo: AdminRepository,
    private readonly userRepo: UserRepository
  ) { }


  async togglePatientStatus(id: string) {
    const patient = await this.userRepo.findById(id)
    if (!patient) {
      throw new Error("Doctor not found")
    }
    const newStatus = !patient.isActive
    return await this.userRepo.update(id, { isActive: newStatus })
  }

  async createPatient(data: IPatient, file: any) {
    const email = data.email
    const existingPatient = await this.userRepo.findByEmail(email)
    if (existingPatient) {
      throw new Error("patient alredy account")
    }
    const patientImgUrl = await uploadBufferToCloudinary(file.buffer, "patient/profile")
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const patientRecord: Partial<IPatient> = {
      ...data,
      password: hashedPassword,
      image: patientImgUrl,
    };
    const newPatient = await this.userRepo.create(patientRecord);
    const result = newPatient.toObject();
    delete result.password;
    return result;
  }
}