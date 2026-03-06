import bcrypt from "bcryptjs";
import { MESSAGES } from "../../../constants/messages.ts";
import { HttpStatusCode } from "../../../constants/enums.ts";
import { IDoctor } from "../../../models/doctor.model.ts";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.ts";
import { DoctorUploadFiles } from "../../../types/doctor.types.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { DoctorMapper } from "../../../mappers/doctor.mapper.ts";
import { IDoctorAuthService, DoctorAuthResponse } from "./doctor.auth.service.interface.ts";
import { FilterQuery } from "mongoose";
import { ITokenService } from "../../token/token.service.interface.ts";
import { IDoctorRepository } from "../../../repositories/doctor/doctor.repository.interface.ts";
import { DoctorDTO, LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { IHospitalRepository } from "../../../repositories/hospital/hospital.repository.interface.ts";
import { HospitalMapper } from "../../../mappers/hospital.mapper.ts";
import { IHospital } from "../../../models/hospital.model.ts";
import { Types } from "mongoose";
import { IDepartmentRepository } from "../../../repositories/hospital/department.repository.interface.ts";
import { IQualificationRepository } from "../../../repositories/hospital/qualification.repository.interface.ts";
import { ISpecializationRepository } from "../../../repositories/hospital/specialization.repository.interface.ts";


export class DoctorAuthService implements IDoctorAuthService {
    constructor(
        private readonly _doctorRepo: IDoctorRepository,
        private readonly _tokenService: ITokenService,
        private readonly _doctorMapper: DoctorMapper,
        private readonly _hospitalRepo: IHospitalRepository,
        private readonly _hospitalMapper: HospitalMapper,
        private readonly _departmentRepo: IDepartmentRepository,
        private readonly _qualificationRepo: IQualificationRepository,
        private readonly _specializationRepo: ISpecializationRepository
    ) {
    }
    async registerDoctor(body: DoctorDTO, files: DoctorUploadFiles) {
        let profileImageUrl = "";
        let licenseUrl = "";
        const existingDoctor = await this._doctorRepo.findByEmail(body.email);
        if (existingDoctor) {
            ApiResponse.throwError(HttpStatusCode.CONFLICT, MESSAGES.AUTH.ALREADY_EXISTS);
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
            hospital_id: new Types.ObjectId(body.hospital_id),
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
        : Promise<DoctorAuthResponse> {
        const doctor = await this._doctorRepo.findByEmailWithPassword(loginData.email);
        if (!doctor) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.AUTH.LOGIN_FAILED);
        }

        if (!doctor.isActive) {
            ApiResponse.throwError(HttpStatusCode.FORBIDDEN, MESSAGES.AUTH.ACCOUNT_BLOCKED);
        }

        const isPasswordMatch = await bcrypt.compare(
            loginData.password,
            doctor.password!
        );

        if (!isPasswordMatch) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.AUTH.LOGIN_FAILED);
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

        return { user: this._doctorMapper.toDTO(doctor), accessToken, refreshToken };
    }

    async getAvailableHospitals(page: number, limit: number, search: string) {
        const filter: FilterQuery<IHospital> = {
            reviewStatus: "approved",
            isActive: true
        };
        if (search) {
            filter.$or = [
                { hospitalName: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } }
            ];
        }

        const result = await this._hospitalRepo.findWithPagination({
            page,
            limit,
            filter,
        });

        return {
            hospitals: result.data.map(h => this._hospitalMapper.toDTO(h)),
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
            currentPage: page
        };
    }

    async getHospitalDepartments(hospitalId: string) {
        return this._departmentRepo.findByHospitalId(hospitalId);
    }

    async getHospitalQualifications(hospitalId: string) {
        return this._qualificationRepo.findByHospitalId(hospitalId);
    }

    async getHospitalSpecializations(hospitalId: string, departmentId?: string) {
        if (departmentId) {
            return this._specializationRepo.findByDepartmentId(departmentId);
        }
        return this._specializationRepo.findByHospitalId(hospitalId);
    }
}
