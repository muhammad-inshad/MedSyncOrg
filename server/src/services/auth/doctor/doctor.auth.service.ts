import bcrypt from "bcryptjs";
import { MESSAGES } from "../../../constants/messages.ts";
import { StatusCode } from "../../../constants/statusCodes.ts";
import { IDoctor } from "../../../models/doctor.model.ts";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.ts";
import { IDoctorAuthService } from "./doctor.auth.service.interface.ts";
import { ITokenService } from "../../../interfaces/auth.types.ts";
import { IDoctorRepository } from "../../../repositories/doctor/doctor.repository.interface.ts";
import { DoctorDTO, LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { DoctorUploadFiles } from "../../../types/doctor.types.ts";


export class DoctorAuthService implements IDoctorAuthService {
    constructor(private readonly _doctorRepo: IDoctorRepository, private readonly _tokenService: ITokenService) {
    }
    async registerDoctor(body: DoctorDTO, files: DoctorUploadFiles) {
        let profileImageUrl = "";
        let licenseUrl = "";
        const existingDoctor = await this._doctorRepo.findByEmail(body.email);
        if (existingDoctor) {
            throw {
                status: StatusCode.CONFLICT,
                message: MESSAGES.AUTH.ALREADY_EXISTS,
            };
        }
        if (files?.profileImage?.[0]) {
            profileImageUrl = await uploadBufferToCloudinary(
                files.profileImage[0].buffer,
                "doctors/profile"
            );
        }

        if (files?.license?.[0]) {
            licenseUrl = await uploadBufferToCloudinary(
                files.license[0].buffer,
                "doctors/license"
            );
        }
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const doctorData: Partial<IDoctor> = {
            name: body.name,
            email: body.email,
            password: hashedPassword,
            phone: body.phone,
            address: body.address,
            specialization: body.specialization,
            qualification: body.qualification,
            experience: body.experience,
            department: body.department,
            about: body.about,
            licence: licenseUrl,
            profileImage: profileImageUrl,
            isActive: true,
            isAccountVerified: false,
            reviewStatus: "pending",
            consultationTime: {
                start: "09:00 AM",
                end: "05:00 PM",
            },

            payment: {
                type: "fixed",
                payoutCycle: "monthly",
                patientsPerDayLimit: 10,
                fixedSalary: 0,
            },
        };

        return this._doctorRepo.create(doctorData);
    }

    async loginDoctor(loginData: LoginDTO)
        : Promise<{ user: DoctorDTO; accessToken: string; refreshToken: string }> {
        const doctor = await this._doctorRepo.findByEmailWithPassword(loginData.email);
        if (!doctor) {
            throw { status: StatusCode.BAD_REQUEST, message: MESSAGES.AUTH.LOGIN_FAILED };
        }

        if (!doctor.isActive) {
            throw { status: StatusCode.FORBIDDEN, message: MESSAGES.AUTH.ACCOUNT_BLOCKED };
        }

        const isPasswordMatch = await bcrypt.compare(
            loginData.password,
            doctor.password
        );

        if (!isPasswordMatch) {
            throw { status: StatusCode.BAD_REQUEST, message: MESSAGES.AUTH.LOGIN_FAILED };
        }
        const accessToken = this._tokenService.generateAccessToken({
            userId: doctor._id.toString(),
            email: doctor.email,
            role: loginData.role
        });

        const refreshToken = this._tokenService.generateRefreshToken({
            userId: doctor._id.toString(),
            email: doctor.email,
            role: loginData.role
        });

        const { password, ...safeUser } = doctor.toObject();
        return { user: safeUser as unknown as any, accessToken, refreshToken };
    }
}