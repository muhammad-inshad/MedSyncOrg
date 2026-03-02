import { ISuperAdminHospitalService, IHospitalManagementResult } from "../interfaces/hospital.service.interface.ts";
import { HttpStatusCode } from "../../../../constants/httpStatus.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { IHospital } from "../../../../models/hospital.model.ts";
import { uploadBufferToCloudinary } from "../../../../utils/cloudinaryUpload.ts";
import { HospitalResponseDTO } from "../../../../dto/hospital/hospital-response.dto.ts";
import { HospitalMapper } from "../../../../mappers/hospital.mapper.ts";
import bcrypt from "bcryptjs";
import { ISuperAdminKYCRepository } from "../../../../repositories/superAdmin/interfaces/superAdminkyc.repository.interface.ts";
import { IHospitalRepository } from "../../../../repositories/hospital/hospital.repository.interface.ts";

export class SuperAdminHospitalService implements ISuperAdminHospitalService {
    constructor(
        private readonly kycRepo: ISuperAdminKYCRepository,
        private readonly hospitalRepo: IHospitalRepository,
        private readonly hospitalMapper: HospitalMapper
    ) { }

    async hospitalManagement(options: { page: number; limit: number; search?: string }): Promise<IHospitalManagementResult> {
        const { page, limit, search } = options;
        const result = await this.kycRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["hospitalName", "email"],
            filter: { reviewStatus: 'approved' }
        });
        return {
            data: result.data.map(h => this.hospitalMapper.toDTO(h as IHospital)),
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }

    async setActive(id: string, isActive: boolean): Promise<HospitalResponseDTO & { message: string }> {
        const updatedHospital = await this.kycRepo.update(id, { isActive } as Partial<IHospital>);

        if (!updatedHospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Hospital not found");
        }

        return {
            ...this.hospitalMapper.toDTO(updatedHospital),
            message: `Hospital successfully ${isActive ? 'activated' : 'deactivated'}`
        };
    }

    async updateHospitalStatus(id: string, status: string, reason?: string): Promise<HospitalResponseDTO | null> {
        const updateData: Partial<IHospital> = {
            reviewStatus: status as "pending" | "approved" | "revision" | "rejected",
        };

        if (reason) {
            updateData.rejectionReason = reason;
        } else {
            updateData.rejectionReason = undefined;
        }
        const updated = await this.kycRepo.update(id, updateData);
        return updated ? this.hospitalMapper.toDTO(updated) : null;
    }

    async addHospital(
        data: Partial<IHospital>,
        files?: { logo?: Express.Multer.File; licence?: Express.Multer.File }
    ): Promise<HospitalResponseDTO> {
        const { email, password, hospitalName, address, phone, since } = data;

        if (!email || !password || !hospitalName || !address || !phone || !since) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Missing required fields");
        }

        const existing = await this.hospitalRepo.findByEmail(email!);
        if (existing) {
            ApiResponse.throwError(HttpStatusCode.CONFLICT, "Hospital with this email already exists");
        }

        let logoUrl = "";
        let licenceUrl = "";

        if (files?.logo) {
            logoUrl = await uploadBufferToCloudinary(files.logo.buffer, "hospitals/logos");
        }
        if (files?.licence) {
            licenceUrl = await uploadBufferToCloudinary(files.licence.buffer, "hospitals/licences");
        }

        const hashedPassword = await bcrypt.hash(password!, 10);

        const created = await this.hospitalRepo.create({
            ...data,
            since: Number(since),
            password: hashedPassword,
            logo: logoUrl || data.logo,
            licence: licenceUrl || data.licence,
            isActive: true,
        } as Partial<IHospital>);

        return this.hospitalMapper.toDTO(created);
    }

    async editHospital(
        id: string,
        updateData: Partial<IHospital> = {},
        files?: { logo?: Express.Multer.File; licence?: Express.Multer.File }
    ): Promise<HospitalResponseDTO | null> {
        const hospital = await this.hospitalRepo.findById(id);
        if (!hospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Hospital not found");
        }

        if (files?.logo) {
            updateData.logo = await uploadBufferToCloudinary(files.logo.buffer, "hospitals/logos");
        }
        if (files?.licence) {
            updateData.licence = await uploadBufferToCloudinary(files.licence.buffer, "hospitals/licences");
        }

        if (updateData.since) {
            updateData.since = Number(updateData.since);
        }

        const updated = await this.hospitalRepo.update(id, updateData);
        return updated ? this.hospitalMapper.toDTO(updated) : null;
    }
}
