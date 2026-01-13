import { AdminRepository } from "../repositories/admin.repository.ts";
import { TokenService } from "../../../services/token.service.ts";
import type { Request } from "express";
import bcrypt from "bcrypt";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.ts";

export class AdminService {
  private adminRepo: AdminRepository;
  private tokenService: TokenService;

  constructor(adminRepo: AdminRepository, tokenService: TokenService) {
    this.adminRepo = adminRepo;
    this.tokenService = tokenService;
  }

  async signup(req: Request) {
    const {
      hospitalName,
      address,
      email,
      phone,
      password,
      since,
      pincode,
      about,
    } = req.body;

    if (!email || !password || !hospitalName) {
      throw { status: 400, message: "Required fields missing" };
    }

    const existingAdmin = await this.adminRepo.findByEmail(email);
    if (existingAdmin) {
      throw { status: 409, message: "Admin already exists" };
    }

    const files = req.files as {
      logo?: Express.Multer.File[];
      licence?: Express.Multer.File[];
    };

    let logoUrl = "";
    let licenceUrl = "";

    if (files?.logo?.[0]) {
      logoUrl = await uploadBufferToCloudinary(
        files.logo[0].buffer,
        "admin/logo"
      );
    }

    if (files?.licence?.[0]) {
      licenceUrl = await uploadBufferToCloudinary(
        files.licence[0].buffer,
        "admin/licence"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await this.adminRepo.createAdmin({
      hospitalName,
      address,
      email,
      phone,
      password: hashedPassword,
      since,
      pincode,
      about,
      logo: logoUrl,
      licence: licenceUrl,
    });

    return {
      success: true,
      message: "Admin registered successfully",
      data: {
        id: admin._id,
        email: admin.email,
        hospitalName: admin.hospitalName,
      },
    };
  }
 
  async loginAdmin(loginData:any)  :Promise<{ user: any; accessToken: string; refreshToken: string }> {
      const admin = await this.adminRepo.findByEmail(loginData.email);
       if(!admin){
           throw { status: 400, message: "Invalid email or password" };
       }
      
        const isPasswordMatch = await bcrypt.compare(
             loginData.password,
             admin.password
           );
  
           if (!isPasswordMatch) {
        throw { status: 400, message: "Invalid email or password" };
      }
       const accessToken = this.tokenService.generateAccessToken(
        admin._id.toString(),
        admin.email,
        loginData.role
      );
  
      const refreshToken = this.tokenService.generateRefreshToken(
        admin._id.toString(),
        admin.email,
        loginData.role
      );
  
      const { password, ...safeUser } = admin.toObject();
      return { user: safeUser, accessToken, refreshToken };
      }
}
