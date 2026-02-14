import { AdminRepository } from "../repositories/admin.repository.ts";
import { TokenService } from "./token.service.ts";
import { LoginDTO } from "../dto/auth/signup.dto.ts";
import { IAdmin } from "../models/admin.model.ts";
import bcrypt from "bcrypt";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.ts";
import { StatusCode } from "../constants/statusCodes.ts";
import { MESSAGES } from "../constants/messages.ts";

export class AdminService {
  private readonly _adminRepo: AdminRepository;
  private readonly _tokenService: TokenService;

  constructor(
    adminRepo: AdminRepository,
    tokenService: TokenService
  ) {
    this._adminRepo = adminRepo;
    this._tokenService = tokenService;
  }

  async signup(adminData: Partial<IAdmin>, files: { logo?: any; licence?: any }) {
    const { email, password, hospitalName } = adminData;

    if (!email || !password || !hospitalName) {
      throw { status: StatusCode.BAD_REQUEST, message: "Required fields missing" };
    }

    const existingAdmin = await this._adminRepo.findByEmail(email);
    if (existingAdmin) {
      throw { status: StatusCode.CONFLICT, message: MESSAGES.ADMIN.HOSPITAL_EXISTS };
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

    const admin = await this._adminRepo.create({
      ...adminData,
      password: hashedPassword,
      logo: logoUrl,
      licence: licenceUrl,
      isActive: true,
    });
    const adminObject = admin.toObject();
    const { password: _, __v, ...adminWithoutPassword } = adminObject;

    return {
      admin: adminWithoutPassword,
    };
  }

  async loginAdmin(loginData: LoginDTO): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const admin = await this._adminRepo.findByEmailWithPassword(loginData.email);

    if (!admin) {
      throw { status: StatusCode.BAD_REQUEST, message: MESSAGES.AUTH.LOGIN_FAILED };
    }

    if (!admin.isActive) {
      throw { status: StatusCode.FORBIDDEN, message: MESSAGES.AUTH.ACCOUNT_BLOCKED };
    }

    const isPasswordMatch = await bcrypt.compare(loginData.password, admin.password);

    if (!isPasswordMatch) {
      throw { status: StatusCode.BAD_REQUEST, message: MESSAGES.AUTH.LOGIN_FAILED };
    }

    const accessToken = this._tokenService.generateAccessToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: loginData.role
    });

    const refreshToken = this._tokenService.generateRefreshToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: loginData.role
    });

    const adminObj = admin.toObject();
    const { password, ...safeUser } = adminObj;

    return { user: safeUser, accessToken, refreshToken };
  }

  async getAdminProfile(adminID: string) {
    try {
      const admin = await this._adminRepo.findById(adminID);
      if (!admin) {
        throw { status: StatusCode.NOT_FOUND, message: "admin not found" };
      }
      return {
        ...admin,
        role: "admin"
      };
    }
    catch (error: any) {
      throw {
        status: error.status || StatusCode.INTERNAL_SERVER_ERROR,
        message: error.message || MESSAGES.ADMIN.FETCH_SUCCESS
      };
    }
  }
  async getAllHospitals() {
    try {
      // Assuming admins are hospitals. If there's a specific flag, filter by it.
      // Based on schema, 'hospitalName' is required, so all admins are hospitals or superadmins.
      // We might want to filter out superadmins if they exist and are distinguished (e.g. by role, but role is in LoginDTO not schema explicitly for 'admin' vs 'superadmin' in the same collection unless 'role' field exists).
      // The LoginDTO has role, but the schema doesn't seem to have a 'role' field stored, unless it's implicit?
      // Actually, 'role' is passed during login.
      // Let's just return all admins for now, or filter by isActive: true.
      const hospitals = await this._adminRepo.findAll();
      return hospitals.filter(admin => admin.isActive).map(admin => {
        const { password, ...safeAdmin } = admin.toObject();
        return safeAdmin;
      });
    } catch (error: any) {
      throw {
        status: error.status || StatusCode.INTERNAL_SERVER_ERROR,
        message: error.message || "Failed to fetch hospitals"
      };
    }
  }
}
