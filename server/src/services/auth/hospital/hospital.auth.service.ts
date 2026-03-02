import bcrypt from "bcryptjs";
import { MESSAGES } from "../../../constants/messages.ts";
import { HttpStatusCode } from "../../../constants/httpStatus.ts";
import Logger from "../../../utils/logger.ts";
import { IHospital } from "../../../models/hospital.model.ts";
import { IHospitalRepository } from "../../../repositories/hospital/hospital.repository.interface.ts";
import { ITokenService } from "../../token/token.service.interface.ts";
import { UnifiedUser, AuthResponse } from "../../../interfaces/auth.types.ts";
import { LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.ts";
import { HospitalUploadFiles } from "../../../types/hospital.type.ts";
import { IHospitalAuthService } from "./hospital.auth.service.interface.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { HospitalMapper } from "../../../mappers/hospital.mapper.ts";
import { HospitalResponseDTO } from "../../../dto/hospital/hospital-response.dto.ts";

export class HospitalAuthService implements IHospitalAuthService {
    constructor(
        private readonly _hospitalRepo: IHospitalRepository,
        private readonly _tokenService: ITokenService,
        private readonly _hospitalMapper: HospitalMapper
    ) { }

    async signup(hospitalData: Partial<IHospital>, files: HospitalUploadFiles): Promise<{ hospital: HospitalResponseDTO }> {
        const { email, password, hospitalName } = hospitalData;

        if (!email || !password || !hospitalName) {
            Logger.warn("Signup failed: Required fields missing");
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
        }

        const existingHospital = await this._hospitalRepo.findByEmail(email!);
        if (existingHospital) {
            Logger.warn(`Signup failed: Hospital already exists for email ${email}`);
            ApiResponse.throwError(HttpStatusCode.CONFLICT, MESSAGES.ADMIN.HOSPITAL_EXISTS);
        }

        let logoUrl = "";
        let licenceUrl = "";

        try {
            if (files.logo && files.logo.length > 0) {
                logoUrl = await uploadBufferToCloudinary(files.logo[0].buffer, "hospital/logo");
            }

            if (files.licence && files.licence.length > 0) {
                licenceUrl = await uploadBufferToCloudinary(files.licence[0].buffer, "hospital/licence");
            }
        } catch (error) {
            Logger.error(`Cloudinary upload failed: ${error}`);
            ApiResponse.throwError(HttpStatusCode.INTERNAL_SERVER_ERROR, MESSAGES.SERVER.INTERNAL_ERROR);
        }

        const hashedPassword = await bcrypt.hash(password!, 10);

        const hospital = await this._hospitalRepo.create({
            ...hospitalData,
            password: hashedPassword,
            logo: logoUrl,
            licence: licenceUrl,
        });
        Logger.info(`New Hospital registered: ${email}`);

        return {
            hospital: this._hospitalMapper.toDTO(hospital),
        };
    }

    async loginHospital(loginData: LoginDTO): Promise<AuthResponse> {
        const hospital = await this._hospitalRepo.findByEmailWithPassword(loginData.email);

        if (!hospital) {
            Logger.warn(`Login failed: Hospital not found for email ${loginData.email}`);
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.AUTH.LOGIN_FAILED);
        }
        console.log(hospital.isActive)
        if (!hospital.isActive) {
            Logger.warn(`Login failed: Account blocked for email ${loginData.email}`);
            ApiResponse.throwError(HttpStatusCode.FORBIDDEN, MESSAGES.AUTH.ACCOUNT_BLOCKED);
        }

        const isPasswordMatch = await bcrypt.compare(loginData.password, hospital.password!);

        if (!isPasswordMatch) {
            Logger.warn(`Login failed: Invalid password for email ${loginData.email}`);
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.AUTH.LOGIN_FAILED);
        }

        const accessToken = this._tokenService.generateAccessToken({
            userId: hospital._id.toString(),
            email: hospital.email,
            role: loginData.role
        });

        const refreshToken = this._tokenService.generateRefreshToken({
            userId: hospital._id.toString(),
            email: hospital.email,
            role: loginData.role
        });

        Logger.info(`Hospital logged in: ${loginData.email}`);

        return { user: this._hospitalMapper.toDTO(hospital) as UnifiedUser, accessToken, refreshToken };
    }
}
