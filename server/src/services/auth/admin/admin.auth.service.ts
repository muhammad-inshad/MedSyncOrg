import bcrypt from "bcryptjs";
import { MESSAGES } from "../../../constants/messages.ts";
import { HttpStatusCode } from "../../../constants/httpStatus.ts";
import Logger from "../../../utils/logger.ts";
import { IAdmin } from "../../../models/admin.model.ts";
import { IAdminRepository } from "../../../repositories/admin/admin.repository.interface.ts";
import { ITokenService, UnifiedUser, AuthResponse } from "../../../interfaces/auth.types.ts";
import { LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.ts";
import { AdminUploadFiles } from "../../../types/admin.type.ts";
import { IAdminAuthService } from "./admin.auth.service.interface.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";

export class AdminAuthService implements IAdminAuthService {
  constructor(
    private readonly _adminRepo: IAdminRepository,
    private readonly _tokenService: ITokenService
  ) { }

  async signup(adminData: Partial<IAdmin>, files: AdminUploadFiles): Promise<{ admin: Partial<IAdmin> }> {
    const { email, password, hospitalName } = adminData;

    if (!email || !password || !hospitalName) {
      Logger.warn("Signup failed: Required fields missing");
      ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
    }

    const existingAdmin = await this._adminRepo.findByEmail(email!);
    if (existingAdmin) {
      Logger.warn(`Signup failed: Admin/Hospital already exists for email ${email}`);
      ApiResponse.throwError(HttpStatusCode.CONFLICT, MESSAGES.ADMIN.HOSPITAL_EXISTS);
    }

    let logoUrl = "";
    let licenceUrl = "";

    try {
      if (files.logo && files.logo.length > 0) {
        logoUrl = await uploadBufferToCloudinary(files.logo[0].buffer, "admin/logo");
      }

      if (files.licence && files.licence.length > 0) {
        licenceUrl = await uploadBufferToCloudinary(files.licence[0].buffer, "admin/licence");
      }
    } catch (error) {
      Logger.error(`Cloudinary upload failed: ${error}`);
      ApiResponse.throwError(HttpStatusCode.INTERNAL_SERVER_ERROR, MESSAGES.SERVER.INTERNAL_ERROR);
    }

    const hashedPassword = await bcrypt.hash(password!, 10);

    const admin = await this._adminRepo.create({
      ...adminData,
      password: hashedPassword,
      logo: logoUrl,
      licence: licenceUrl,
      isActive: true,
    });
    Logger.info(`New Admin/Hospital registered: ${email}`);

    const adminObject = admin.toObject();
    const { ...adminWithoutPassword } = adminObject;

    return {
      admin: adminWithoutPassword,
    };
  }

  async loginAdmin(loginData: LoginDTO): Promise<AuthResponse> {
    const admin = await this._adminRepo.findByEmailWithPassword(loginData.email);

    if (!admin) {
      Logger.warn(`Login failed: Admin not found for email ${loginData.email}`);
      ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.AUTH.LOGIN_FAILED);
    }

    if (!admin.isActive) {
      Logger.warn(`Login failed: Account blocked for email ${loginData.email}`);
      ApiResponse.throwError(HttpStatusCode.FORBIDDEN, MESSAGES.AUTH.ACCOUNT_BLOCKED);
    }

    const isPasswordMatch = await bcrypt.compare(loginData.password, admin.password!);

    if (!isPasswordMatch) {
      Logger.warn(`Login failed: Invalid password for email ${loginData.email}`);
      ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.AUTH.LOGIN_FAILED);
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

    Logger.info(`Admin logged in: ${loginData.email}`);

    const adminObj = admin.toObject();
    const { ...safeUser } = adminObj;

    return { user: safeUser as UnifiedUser, accessToken, refreshToken };
  }
}

