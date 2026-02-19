import { AdminRepository } from "../repositories/admin/admin.repository.ts";
import { TokenService } from "./token.service.ts";
import { LoginDTO } from "../dto/auth/signup.dto.ts";
import { IAdmin } from "../models/admin.model.ts";
import bcrypt from "bcrypt";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.ts";
import { StatusCode } from "../constants/statusCodes.ts";
import { MESSAGES } from "../constants/messages.ts";
import { IAdminService } from "../interfaces/IAdminService.ts";
import Logger from "../utils/logger.ts";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.ts";
import { UserRepository } from "../repositories/patient/user.repository.ts";

export class AdminService implements IAdminService {
  private readonly _adminRepo: AdminRepository;
  private readonly _tokenService: TokenService;
  private readonly _doctorRepo: DoctorRepository;
  private readonly _patientRepo: UserRepository;

  constructor(
    adminRepo: AdminRepository,
    tokenService: TokenService,
    doctorRepo: DoctorRepository,
    patientRepo: UserRepository
  ) {
    this._adminRepo = adminRepo;
    this._tokenService = tokenService;
    this._doctorRepo = doctorRepo;
    this._patientRepo = patientRepo;
  }

  async getDashboardStats(adminId: string) {
    try {
      // Count Doctors for this hospital
      const totalDoctors = await (this._doctorRepo as any).model.countDocuments({ hospital_id: adminId });
      const activeDoctors = await (this._doctorRepo as any).model.countDocuments({ hospital_id: adminId, isActive: true });

      // Count Patients for this hospital
      const totalPatients = await (this._patientRepo as any).model.countDocuments({ hospital_id: adminId });

      return {
        totalDoctors,
        activeDoctors,
        totalPatients
      };
    } catch (error: any) {
      Logger.error(`Get Dashboard Stats Error: ${error.message}`);
      throw {
        status: error.status || StatusCode.INTERNAL_SERVER_ERROR,
        message: error.message || "Failed to fetch dashboard stats"
      };
    }
  }


  async getAdminProfile(adminID: string) {
    try {
      const admin = await this._adminRepo.findById(adminID);
      if (!admin) {
        Logger.warn(`Get Profile failed: Admin not found with ID ${adminID}`);
        throw { status: StatusCode.NOT_FOUND, message: MESSAGES.ADMIN.NOT_FOUND || "Admin not found" };
      }
      return {
        ...admin.toObject(),
        role: "admin"
      };
    }
    catch (error: any) {
      Logger.error(`Get Profile Error: ${error.message}`);
      throw {
        status: error.status || StatusCode.INTERNAL_SERVER_ERROR,
        message: error.message || MESSAGES.ADMIN.FETCH_SUCCESS
      };
    }
  }
  async getAllHospitals() {
    try {
      const hospitals = await this._adminRepo.findAll();
      return hospitals.filter(admin => admin.isActive).map(admin => {
        const { password, ...safeAdmin } = admin.toObject();
        return safeAdmin;
      });
    } catch (error: any) {
      Logger.error(`Get All Hospitals Error: ${error.message}`);
      throw {
        status: error.status || StatusCode.INTERNAL_SERVER_ERROR,
        message: error.message || "Failed to fetch hospitals"
      };
    }
  }
}
