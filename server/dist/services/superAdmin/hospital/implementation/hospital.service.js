import { HttpStatusCode } from "../../../../constants/enums.js";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { uploadBufferToCloudinary } from "../../../../utils/cloudinaryUpload.js";
import { HospitalStatusUpdateResponseSchema } from "../../../../dto/hospital/hospital-response.dto.js";
import bcrypt from "bcryptjs";
export class SuperAdminHospitalService {
    constructor(kycRepo, hospitalRepo, hospitalMapper, subscriptionRepo, _doctorRepo) {
        this.kycRepo = kycRepo;
        this.hospitalRepo = hospitalRepo;
        this.hospitalMapper = hospitalMapper;
        this.subscriptionRepo = subscriptionRepo;
        this._doctorRepo = _doctorRepo;
    }
    async hospitalManagement(options) {
        const { page, limit, search, isActive } = options;
        const filter = {
            reviewStatus: 'approved',
        };
        if (isActive !== undefined) {
            filter.isActive = isActive;
        }
        const result = await this.kycRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["hospitalName", "email"],
            filter
        });
        return {
            data: result.data.map(h => this.hospitalMapper.toDTO(h)),
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }
    async setActive(id, isActive) {
        const updatedHospital = await this.kycRepo.update(id, { isActive });
        if (!updatedHospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Hospital not found");
        }
        return HospitalStatusUpdateResponseSchema.parse({
            ...this.hospitalMapper.toDTO(updatedHospital),
            message: `Hospital successfully ${isActive ? 'activated' : 'deactivated'}`
        });
    }
    async updateHospitalStatus(id, status, reason) {
        const updateData = {
            reviewStatus: status,
        };
        if (reason) {
            updateData.rejectionReason = reason;
        }
        else {
            updateData.rejectionReason = undefined;
        }
        const updated = await this.kycRepo.update(id, updateData);
        return updated ? this.hospitalMapper.toDTO(updated) : null;
    }
    async addHospital(data, files) {
        const { email, password, hospitalName, address, phone, since } = data;
        if (!email || !password || !hospitalName || !address || !phone || !since) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Missing required fields");
        }
        const existing = await this.hospitalRepo.findByEmail(email);
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
        const hashedPassword = await bcrypt.hash(password, 10);
        // Calculate subscription end date if plan is provided
        if (data.subscription && data.subscription.plan) {
            const planDetails = await this.subscriptionRepo.findByPlanName(data.subscription.plan);
            if (planDetails) {
                const startDate = data.subscription.startDate ? new Date(data.subscription.startDate) : new Date();
                const duration = planDetails.duration || 1;
                const durationUnit = planDetails.durationUnit || 'months';
                data.subscription.startDate = startDate;
                (data.subscription).endDate = this.calculateSubscriptionEndDate(startDate, duration, durationUnit);
            }
        }
        const createdData = {
            ...data,
            since: Number(since),
            password: hashedPassword,
            logo: logoUrl || data.logo,
            licence: licenceUrl || data.licence,
            isActive: true,
        };
        const created = await this.hospitalRepo.create(createdData);
        return this.hospitalMapper.toDTO(created);
    }
    async editHospital(id, updateData = {}, files) {
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
                (updateData.subscription).endDate = this.calculateSubscriptionEndDate(startDate, duration, durationUnit);
            }
        }
        const updated = await this.hospitalRepo.update(id, updateData);
        return updated ? this.hospitalMapper.toDTO(updated) : null;
    }
    calculateSubscriptionEndDate(startDate, duration, unit) {
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
