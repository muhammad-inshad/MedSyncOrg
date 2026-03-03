import { Types } from "mongoose";
import { IDoctorRepository } from "../../../../repositories/doctor/doctor.repository.interface.ts";
import Logger from "../../../../utils/logger.ts";
import { HttpStatusCode } from "../../../../constants/httpStatus.ts";
import { IDoctor } from "../../../../models/doctor.model.ts";
import { IPaginationResult, IDoctorListOptions } from "../../../../types/hospital.types.ts";
import { IDoctorManagementService } from "../interfaces/IDoctorManagementService.ts";
import bcrypt from "bcryptjs";
import { MESSAGES } from "../../../../constants/messages.ts";
import { uploadBufferToCloudinary } from "../../../../utils/cloudinaryUpload.ts";
import { DoctorUploadFiles } from "../../../../types/doctor.types.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { DoctorResponseDTO, UpdateDoctorDTO } from "../../../../dto/doctor/doctor-response.dto.ts";
import { DoctorMapper } from "../../../../mappers/doctor.mapper.ts";
import { DoctorDTO } from "../../../../dto/auth/signup.dto.ts";

export class DoctorManagementService implements IDoctorManagementService {
    constructor(
        private readonly _doctorRepo: IDoctorRepository,
        private readonly _doctorMapper: DoctorMapper
    ) { }

    async getAllDoctors(options: IDoctorListOptions): Promise<IPaginationResult<DoctorResponseDTO>> {
        const { page, limit, search, filter } = options;
        const result = await this._doctorRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "email", "specialization"],
            filter,
        });
        return {
            data: result.data.map(doc => this._doctorMapper.toDTO(doc)),
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }

    async doctorsToggle(id: string): Promise<DoctorResponseDTO | null> {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            Logger.warn(`Toggle Doctor status failed: Doctor not found with ID ${id}`);
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Doctor not found");
        }

        const newStatus = !doctor.isActive;
        Logger.info(`Doctor status toggled: ${id} to ${newStatus}`);
        const updated = await this._doctorRepo.update(id, { isActive: newStatus } as Partial<IDoctor>);
        return updated ? this._doctorMapper.toDTO(updated) : null;
    }

    async acceptDoctor(id: string): Promise<DoctorResponseDTO | null> {
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
        } as Partial<IDoctor>);
        return updated ? this._doctorMapper.toDTO(updated) : null;
    }

    async rejectDoctor(id: string): Promise<DoctorResponseDTO | null> {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            Logger.warn(`Reject Doctor failed: Doctor not found with ID ${id}`);
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Doctor not found");
        }

        Logger.info(`Doctor rejected: ${id}`);
        const updated = await this._doctorRepo.update(id, {
            reviewStatus: "rejected",
            isActive: true,
        } as Partial<IDoctor>);
        return updated ? this._doctorMapper.toDTO(updated) : null;
    }

    async requestRevisionDoctor(id: string): Promise<DoctorResponseDTO | null> {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            Logger.warn(`Request Revision failed: Doctor not found with ID ${id}`);
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Doctor not found");
        }

        Logger.info(`Doctor revision requested: ${id}`);
        const updated = await this._doctorRepo.update(id, {
            reviewStatus: "revision",
            isActive: true,
        } as Partial<IDoctor>);
        return updated ? this._doctorMapper.toDTO(updated) : null;
    }

    async registerDoctor(data: DoctorDTO, files: DoctorUploadFiles): Promise<DoctorResponseDTO> {
        let profileImageUrl = "";
        let licenseUrl = "";

        const existingDoctor = await this._doctorRepo.findByEmail(data.email);
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

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const doctorData: Partial<IDoctor> = {
            name: data.name,
            email: data.email,
            password: hashedPassword,
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

        const created = await this._doctorRepo.create(doctorData);
        return this._doctorMapper.toDTO(created);
    }

    async updateDoctor(id: string, data: UpdateDoctorDTO, files: DoctorUploadFiles): Promise<DoctorResponseDTO | null> {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Doctor not found");

        }

        let profileImageUrl = doctor.profileImage;
        let licenseUrl = doctor.licence;

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
        let consultationTime = data.consultationTime;
        if (typeof consultationTime === 'string') {
            try {
                consultationTime = JSON.parse(consultationTime);
            } catch (e) {
                Logger.error("Failed to parse consultationTime", e);
            }
        }

        let payment = data.payment;
        if (typeof payment === 'string') {
            try {
                payment = JSON.parse(payment);
            } catch (e) {
                Logger.error("Failed to parse payment", e);
            }
        }

        const updateData: Partial<IDoctor> = {
            ...data,
            hospital_id: data.hospital_id ? (typeof data.hospital_id === 'string' ? new Types.ObjectId(data.hospital_id) : data.hospital_id) : undefined,
            profileImage: profileImageUrl,
            licence: licenseUrl,
            consultationTime: {
                start: consultationTime?.start || doctor.consultationTime.start,
                end: consultationTime?.end || doctor.consultationTime.end,
            },
            payment: {
                type: (payment?.type || doctor.payment.type) as "commission" | "fixed",
                commissionPercentage: payment?.commissionPercentage ?? doctor.payment.commissionPercentage,
                fixedSalary: payment?.fixedSalary ?? doctor.payment.fixedSalary,
                payoutCycle: (payment?.payoutCycle || doctor.payment.payoutCycle) as "weekly" | "monthly",
                patientsPerDayLimit: payment?.patientsPerDayLimit ?? doctor.payment.patientsPerDayLimit,
            },
            isActive: data.isActive === 'true' || data.isActive === true,
            isAccountVerified: data.isAccountVerified === 'true' || data.isAccountVerified === true,
        };

        const updated = await this._doctorRepo.update(id, updateData);
        return updated ? this._doctorMapper.toDTO(updated) : null;
    }

}
