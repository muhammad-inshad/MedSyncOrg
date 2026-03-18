import { ISuperAdminHospitalService, IHospitalManagementResult } from "../interfaces/hospital.service.interface.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { IHospital } from "../../../../models/hospital.model.ts";
import { uploadBufferToCloudinary } from "../../../../utils/cloudinaryUpload.ts";
import { HospitalResponseDTO, HospitalStatusUpdateResponseDTO, HospitalStatusUpdateResponseSchema, CreateHospitalDTO, UpdateHospitalDTO } from "../../../../dto/hospital/hospital-response.dto.ts";
import { HospitalMapper } from "../../../../mappers/hospital.mapper.ts";
import bcrypt from "bcryptjs";
import { ISuperAdminKYCRepository } from "../../../../repositories/superAdmin/interfaces/superAdminkyc.repository.interface.ts";
import { IHospitalRepository } from "../../../../repositories/hospital/hospital.repository.interface.ts";
import { ISubscriptionRepository } from "../../../../repositories/superAdmin/subscription/interfaces/subscription.repository.interface.ts";

export class SuperAdminHospitalService implements ISuperAdminHospitalService {
    constructor(
        private readonly kycRepo: ISuperAdminKYCRepository,
        private readonly hospitalRepo: IHospitalRepository,
        private readonly hospitalMapper: HospitalMapper,
        private readonly subscriptionRepo: ISubscriptionRepository
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

    async setActive(id: string, isActive: boolean): Promise<HospitalStatusUpdateResponseDTO> {
        const updatedHospital = await this.kycRepo.update(id, { isActive } as Partial<IHospital>);

        if (!updatedHospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Hospital not found");
        }

        return HospitalStatusUpdateResponseSchema.parse({
            ...this.hospitalMapper.toDTO(updatedHospital),
            message: `Hospital successfully ${isActive ? 'activated' : 'deactivated'}`
        });
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
        data: CreateHospitalDTO,
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

        // Calculate subscription end date if plan is provided
        if (data.subscription && data.subscription.plan) {
            const planDetails = await this.subscriptionRepo.findByPlanName(data.subscription.plan);
            if (planDetails) {
                const startDate = data.subscription.startDate ? new Date(data.subscription.startDate) : new Date();
                const duration = planDetails.duration || 1;
                const durationUnit = planDetails.durationUnit || 'months';
                
                data.subscription.startDate = startDate;
                (data.subscription as any).endDate = this.calculateSubscriptionEndDate(startDate, duration, durationUnit);
            }
        }

        const createdData: Partial<IHospital> = {
            ...data,
            since: Number(since),
            password: hashedPassword,
            logo: logoUrl || data.logo,
            licence: licenceUrl || data.licence,
            isActive: true,
        } as Partial<IHospital>;

        const created = await this.hospitalRepo.create(createdData);

        return this.hospitalMapper.toDTO(created);
    }

    async editHospital(
        id: string,
        updateData: UpdateHospitalDTO = {},
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

        // Calculate subscription end date if plan is provided
        if (updateData.subscription && updateData.subscription.plan) {
            const planDetails = await this.subscriptionRepo.findByPlanName(updateData.subscription.plan);
            if (planDetails) {
                const startDate = updateData.subscription.startDate ? new Date(updateData.subscription.startDate) : new Date();
                const duration = planDetails.duration || 1;
                const durationUnit = planDetails.durationUnit || 'months';
                
                updateData.subscription.startDate = startDate;
                (updateData.subscription as any).endDate = this.calculateSubscriptionEndDate(startDate, duration, durationUnit);
            }
        }

        const updated = await this.hospitalRepo.update(id, updateData as Partial<IHospital>);
        return updated ? this.hospitalMapper.toDTO(updated) : null;
    }

    private calculateSubscriptionEndDate(startDate: Date, duration: number, unit: string): Date {
        const endDate = new Date(startDate);
        switch (unit) {
            case 'days':
                endDate.setDate(endDate.getDate() + duration);
                break;
            case 'months':
                endDate.setMonth(endDate.getMonth() + duration);
                break;
            case 'years':
                endDate.setFullYear(endDate.getFullYear() + duration);
                break;
            default:
                endDate.setMonth(endDate.getMonth() + duration);
        }
        return endDate;
    }
}
