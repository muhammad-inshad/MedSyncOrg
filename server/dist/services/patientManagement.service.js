import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.ts";
import bcrypt from "bcryptjs";
export class patientManagementService {
    constructor(adminRepo, userRepo) {
        this.adminRepo = adminRepo;
        this.userRepo = userRepo;
    }
    async togglePatientStatus(id) {
        const patient = await this.userRepo.findById(id);
        if (!patient) {
            throw new Error("Doctor not found");
        }
        const newStatus = !patient.isActive;
        return await this.userRepo.update(id, { isActive: newStatus });
    }
    async createPatient(data, file) {
        const email = data.email;
        const existingPatient = await this.userRepo.findByEmail(email);
        if (existingPatient) {
            throw new Error("patient alredy account");
        }
        const patientImgUrl = await uploadBufferToCloudinary(file.buffer, "patient/profile");
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const patientRecord = {
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
