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

export class AdminService implements IAdminService { 
  private readonly _adminRepo: AdminRepository;
  private readonly _tokenService: TokenService;

  constructor(
    adminRepo: AdminRepository,
    tokenService: TokenService
  ) {
    this._adminRepo = adminRepo;
    this._tokenService = tokenService;
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
