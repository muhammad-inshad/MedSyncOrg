import bcrypt from "bcryptjs";
import { MESSAGES } from "../../../constants/messages.js";
import { HttpStatusCode } from "../../../constants/enums.js";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.js";
import { ApiResponse } from "../../../utils/apiResponse.utils.js";
import { Types } from "mongoose";
import logger from "../../../utils/logger.js";
export class DoctorAuthService {
    constructor(_doctorRepo, _tokenService, _doctorMapper, _hospitalRepo, _hospitalMapper, _departmentRepo, _qualificationRepo, _specializationRepo, _departmentMapper, _qualificationMapper, _specializationMapper) {
        this._doctorRepo = _doctorRepo;
        this._tokenService = _tokenService;
        this._doctorMapper = _doctorMapper;
        this._hospitalRepo = _hospitalRepo;
        this._hospitalMapper = _hospitalMapper;
        this._departmentRepo = _departmentRepo;
        this._qualificationRepo = _qualificationRepo;
        this._specializationRepo = _specializationRepo;
        this._departmentMapper = _departmentMapper;
        this._qualificationMapper = _qualificationMapper;
        this._specializationMapper = _specializationMapper;
    }
    async registerDoctor(body, files) {
        let profileImageUrl = "";
        let licenseUrl = "";
        const existingDoctor = await this._doctorRepo.findByEmail(body.email);
        if (existingDoctor) {
            ApiResponse.throwError(HttpStatusCode.CONFLICT, MESSAGES.AUTH.ALREADY_EXISTS);
            logger.warn(`Registration attempt with existing email: ${body.email}`);
        }
        if (files?.profileImage?.[0]) {
            profileImageUrl = await uploadBufferToCloudinary(files.profileImage[0].buffer, "doctors/profile");
        }
        if (files?.license?.[0]) {
            licenseUrl = await uploadBufferToCloudinary(files.license[0].buffer, "doctors/license");
        }
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const doctorData = {
            name: body.name,
            email: body.email,
            password: hashedPassword,
            hospital_id: new Types.ObjectId(body.hospital_id),
            phone: body.phone,
            address: body.address,
            specialization_id: body.specialization,
            qualification: body.qualification,
            experience: body.experience,
            department_id: body.department,
            about: body.about,
            licence: licenseUrl,
            profileImage: profileImageUrl,
            isActive: true,
            isAccountVerified: false,
            reviewStatus: "pending",
        };
        const created = await this._doctorRepo.create(doctorData);
        return this._doctorMapper.toDTO(created);
    }
    async loginDoctor(loginData) {
        const doctor = await this._doctorRepo.findByEmailWithPassword(loginData.email);
        if (!doctor) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.AUTH.LOGIN_FAILED);
        }
        if (!doctor.isActive) {
            ApiResponse.throwError(HttpStatusCode.FORBIDDEN, MESSAGES.AUTH.ACCOUNT_BLOCKED);
        }
        const isPasswordMatch = await bcrypt.compare(loginData.password, doctor.password);
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
    async getAvailableHospitals(page, limit, search) {
        const filter = {
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
    async getHospitalDepartments(hospitalId) {
        const result = await this._departmentRepo.findByHospitalId(hospitalId);
        return result.data.map(d => this._departmentMapper.toDTO(d));
    }
    async getHospitalQualifications(hospitalId) {
        const qualifications = await this._qualificationRepo.findByHospitalId(hospitalId);
        return qualifications.map(q => this._qualificationMapper.toDTO(q));
    }
    async getHospitalSpecializations(hospitalId, departmentId) {
        let result;
        if (departmentId) {
            result = await this._specializationRepo.findByDepartmentId(departmentId);
        }
        else {
            result = await this._specializationRepo.findByHospitalId(hospitalId);
        }
        return result.map(s => this._specializationMapper.toDTO(s));
    }
}
