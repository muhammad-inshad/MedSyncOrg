import { Types } from "mongoose";
import Logger from "../../../../utils/logger.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
import bcrypt from "bcryptjs";
import { MESSAGES } from "../../../../constants/messages.js";
import { uploadBufferToCloudinary } from "../../../../utils/cloudinaryUpload.js";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { CloudinaryImageService } from "../../../image/implementation/cloudinary.image.service.js";
export class DoctorManagementService {
    constructor(_doctorRepo, _doctorMapper, _departmentRepo, _leaveRepo, _subscriptionService, _leaveMapper, _specializationRepo, _qualificationRepo) {
        this._doctorRepo = _doctorRepo;
        this._doctorMapper = _doctorMapper;
        this._departmentRepo = _departmentRepo;
        this._leaveRepo = _leaveRepo;
        this._subscriptionService = _subscriptionService;
        this._leaveMapper = _leaveMapper;
        this._specializationRepo = _specializationRepo;
        this._qualificationRepo = _qualificationRepo;
        this._cloudinary = new CloudinaryImageService();
    }
    async getAllDoctors(options) {
        const { page, limit, search, filter, status } = options;
        const queryFilter = { ...filter };
        if (status === "active") {
            queryFilter.isActive = true;
        }
        else if (status === "blocked") {
            queryFilter.isActive = false;
        }
        else if (status === "pending" ||
            status === "approved" ||
            status === "revision" ||
            status === "rejected") {
            queryFilter.reviewStatus = status;
        }
        const result = await this._doctorRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "email", "specialization"],
            filter: queryFilter,
        });
        const hospitalId = filter?.hospital_id;
        const departmentMap = new Map();
        if (hospitalId) {
            const { data: departments } = await this._departmentRepo.findByHospitalId(hospitalId, 1, 100);
            departments.forEach((dept) => {
                departmentMap.set(dept._id.toString(), dept.departmentName);
            });
        }
        const doctors = result.data.map((doc) => {
            const dto = this._doctorMapper.toDTO(doc);
            if (departmentMap.has(dto.department)) {
                dto.department = departmentMap.get(dto.department);
            }
            return dto;
        });
        return {
            data: doctors,
            total: result.total,
            page: result.page,
            limit: result.limit,
        };
    }
    async doctorsToggle(id) {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            Logger.warn(`Toggle Doctor status failed: Doctor not found with ID ${id}`);
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Doctor not found");
        }
        const newStatus = !doctor.isActive;
        Logger.info(`Doctor status toggled: ${id} to ${newStatus}`);
        const updated = await this._doctorRepo.update(id, {
            isActive: newStatus,
        });
        return updated ? this._doctorMapper.toDTO(updated) : null;
    }
    async acceptDoctor(id) {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            Logger.warn(`Accept Doctor failed: Doctor not found with ID ${id}`);
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Doctor not found");
        }
        Logger.info(`Doctor accepted: ${id}`);
        const updated = await this._doctorRepo.update(id, {
            reviewStatus: "approved",
            isActive: true,
            isAccountVerified: true,
            rejectionReason: undefined,
        });
        return updated ? this._doctorMapper.toDTO(updated) : null;
    }
    async rejectDoctor(id, reason) {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            Logger.warn(`Reject Doctor failed: Doctor not found with ID ${id}`);
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Doctor not found");
        }
        Logger.info(`Doctor rejected: ${id}`);
        const updated = await this._doctorRepo.update(id, {
            reviewStatus: "rejected",
            isActive: true,
            rejectionReason: reason,
        });
        return updated ? this._doctorMapper.toDTO(updated) : null;
    }
    async requestRevisionDoctor(id, reason) {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            Logger.warn(`Request Revision failed: Doctor not found with ID ${id}`);
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Doctor not found");
        }
        Logger.info(`Doctor revision requested: ${id}`);
        const updated = await this._doctorRepo.update(id, {
            reviewStatus: "revision",
            isActive: true,
            rejectionReason: reason,
        });
        return updated ? this._doctorMapper.toDTO(updated) : null;
    }
    async registerDoctor(data, files, hospital_id) {
        await this._subscriptionService.checkSubscriptionLimit(hospital_id, "maxDoctors");
        let profileImageUrl = "";
        let licenseUrl = "";
        const existingDoctor = await this._doctorRepo.findByEmail(data.email);
        if (existingDoctor) {
            ApiResponse.throwError(HttpStatusCode.CONFLICT, MESSAGES.AUTH.ALREADY_EXISTS);
        }
        if (files?.profileImage?.[0]) {
            profileImageUrl = await uploadBufferToCloudinary(files.profileImage[0].buffer, "doctors/profile");
        }
        if (files?.license?.[0]) {
            licenseUrl = await uploadBufferToCloudinary(files.license[0].buffer, "doctors/license");
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const doctorData = {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            hospital_id: new Types.ObjectId(hospital_id),
            phone: data.phone,
            address: data.address,
            specialization: data.specialization,
            qualification: data.qualification,
            experience: data.experience,
            department: data.department,
            about: data.about,
            licence: licenseUrl,
            profileImage: profileImageUrl,
            isActive: true,
            isAccountVerified: true,
            reviewStatus: "pending",
        };
        const created = await this._doctorRepo.create(doctorData);
        return this._doctorMapper.toDTO(created);
    }
    async updateDoctor(id, data, files) {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Doctor not found");
        }
        let profileImageUrl = doctor.profileImage;
        let licenseUrl = doctor.licence;
        if (files?.profileImage?.[0]) {
            profileImageUrl = await uploadBufferToCloudinary(files.profileImage[0].buffer, "doctors/profile");
        }
        if (files?.license?.[0]) {
            licenseUrl = await uploadBufferToCloudinary(files.license[0].buffer, "doctors/license");
        }
        const updateData = {
            ...data,
            hospital_id: data.hospital_id
                ? typeof data.hospital_id === "string"
                    ? new Types.ObjectId(data.hospital_id)
                    : data.hospital_id
                : undefined,
            profileImage: profileImageUrl,
            licence: licenseUrl,
            isActive: data.isActive === "true" || data.isActive === true,
            isAccountVerified: data.isAccountVerified === "true" || data.isAccountVerified === true,
        };
        const updated = await this._doctorRepo.update(id, updateData);
        console.log(updated);
        return updated ? this._doctorMapper.toDTO(updated) : null;
    }
    async getLeaveDoctors(options) {
        const res = await this._leaveRepo.findHospitalLeaves(options);
        return {
            ...res,
            data: res.data.map((leave) => this._leaveMapper.toDTO(leave)),
        };
    }
    async updateLeaveStatus(leaveId, status, reason) {
        const leave = await this._leaveRepo.updateStatus(leaveId, status, reason);
        return leave ? this._leaveMapper.toDTO(leave) : null;
    }
    async getDoctorDetails(id) {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            Logger.warn(`Doctor not found with ID: ${id}`);
            return null;
        }
        const doctorDTO = this._doctorMapper.toDTO(doctor);
        const doctorData = doctor;
        if (doctorData.department_id) {
            const department = await this._departmentRepo.findById(doctorData.department_id.toString());
            if (department) {
                doctorDTO.department = department.departmentName;
            }
        }
        if (doctorData.specialization_id) {
            const specialization = await this._specializationRepo.findById(doctorData.specialization_id);
            if (specialization) {
                doctorDTO.specialization = specialization.name;
            }
        }
        return doctorDTO;
    }
    async getDeptSpecs(hospitalId) {
        const hospitalObjectId = new Types.ObjectId(hospitalId);
        const [departments, specializations, qualifications] = await Promise.all([
            this._departmentRepo.findByFilter({ hospital_id: hospitalObjectId }),
            this._specializationRepo.findByFilter({ hospital_id: hospitalObjectId }),
            this._qualificationRepo.findByFilter({ hospital_id: hospitalObjectId })
        ]);
        return {
            departments,
            specializations,
            qualifications
        };
    }
}
