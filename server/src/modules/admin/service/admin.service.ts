import { AdminRepository } from "../repositories/admin.repository.ts";
import { TokenService } from "../../auth/services/token.service.ts";
import type { Request } from "express";
import { LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { IAdmin } from "../../../model/admin.model.ts";
import bcrypt from "bcrypt";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.ts";

export class AdminService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly tokenService: TokenService
  ) { }

  async signup(adminData: Partial<IAdmin>, files: { logo?: any; licence?: any }) {
    const { email, password, hospitalName } = adminData;

    if (!email || !password || !hospitalName) {
      throw { status: 400, message: "Required fields missing" };
    }

    const existingAdmin = await this.adminRepo.findByEmail(email);
    if (existingAdmin) {
      throw { status: 409, message: "Admin/Hospital already exists" };
    }
    let logoUrl = "";
    let licenceUrl = "";

    if (files.logo) {
      logoUrl = await uploadBufferToCloudinary(files.logo.buffer, "admin/logo");
    }

    if (files.licence) {
      licenceUrl = await uploadBufferToCloudinary(files.licence.buffer, "admin/licence");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await this.adminRepo.createAdmin({
      ...adminData,
      password: hashedPassword,
      logo: logoUrl,
      licence: licenceUrl,
      isActive: true,
    });
     const adminObject = admin.toObject();
    const { password: _, __v, ...adminWithoutPassword } = adminObject;

    return {
      admin:adminWithoutPassword,
    };
  }
  async loginAdmin(loginData: LoginDTO): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const admin = await this.adminRepo.findByEmail(loginData.email);

    if (!admin) {
      throw { status: 400, message: "Invalid email or password" };
    }

    // if (!admin.isActive) {
    //   throw { status: 403, message: "Your hospital account is deactivated. Contact support." };
    // }

    const isPasswordMatch = await bcrypt.compare(loginData.password, admin.password);

    if (!isPasswordMatch) {
      throw { status: 400, message: "Invalid email or password" };
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: loginData.role
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: loginData.role
    });

    const adminObj = admin.toObject();
    const { password, ...safeUser } = adminObj;

    return { user: safeUser, accessToken, refreshToken };
  }

  async getAdminProfile(adminID: string){
    try {
     const admin = await this.adminRepo.findById(adminID);
        if (!admin) {
            throw { status: 404, message: "admin not found" };
        }
        return {
            ...admin,
            role: "admin"
        };
  }
  catch(error: any){
     throw { 
      status: error.status || 500, 
      message: error.message || "Error fetching admin profile" 
    };
  }
}
}