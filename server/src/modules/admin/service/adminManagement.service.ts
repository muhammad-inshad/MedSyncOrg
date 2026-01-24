import { AdminRepository } from "../repositories/admin.repository.ts";
import { TokenService } from "../../auth/services/token.service.ts";
import cloudinary from "../../../config/cloudinary";
import { extractPublicId } from "../../../utils/cloudinaryUpload";
import { DoctorRepository } from "../../doctor/repository/doctor.repository.ts";


export class AdminManagementService{
    constructor(
    private readonly adminRepo: AdminRepository,
    private readonly tokenService: TokenService,
    private readonly doctorrepo:DoctorRepository
  ) { }

  async updateHospital(id: string, updateData: any) {
    const existingHospital = await this.adminRepo.findById(id);
    if (!existingHospital) throw new Error("Hospital not found");

    const imagesToProcess = ["logo", "licence"] as const;

    for (const field of imagesToProcess) {
      const oldUrl = existingHospital[field];
      const newUrl = updateData[field];
      if (newUrl && oldUrl && newUrl !== oldUrl) {
        try {
          const publicId = extractPublicId(oldUrl);
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted old ${field} from Cloudinary: ${publicId}`);
        } catch (error) {
          console.error(`Failed to delete old ${field}:`, error);
        }
      }
    }
    return await this.adminRepo.update(id, updateData);
  }

  async getAllDoctors() {
    const doctors = await this.adminRepo.findAllDoctors();
    if (!doctors || doctors.length === 0) {
      return []; 
    }
    return doctors;
  }
  async toggleDoctorStatus(id: string) {
  const doctor = await this.doctorrepo.findById(id);
  console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",doctor)
  if (!doctor) {
    throw new Error("Doctor not found");
  }
  const newStatus = !doctor.isActive;
  return await this.adminRepo.updateDoctorStatus(id, newStatus);
}
}