import cloudinary from "../config/cloudinary.ts";
import { extractPublicId } from "../utils/cloudinaryUpload.ts";
import { StatusCode } from "../constants/statusCodes.ts";
import { MESSAGES } from "../constants/messages.ts";
export class DoctorManagementService {
    constructor(adminRepo, tokenService, doctorRepo) {
        this._adminRepo = adminRepo;
        this._tokenService = tokenService;
        this._doctorRepo = doctorRepo;
    }
    async updateHospital(id, updateData) {
        const existingHospital = await this._adminRepo.findById(id);
        if (!existingHospital)
            throw { status: StatusCode.NOT_FOUND, message: "Hospital not found" };
        const imagesToProcess = ["logo", "licence"];
        for (const field of imagesToProcess) {
            if (updateData[field] && updateData[field].startsWith('data:image')) {
                try {
                    // Upload new image
                    const base64Data = updateData[field].split(';base64,').pop();
                    const buffer = Buffer.from(base64Data, 'base64');
                    const newUrl = await import("../utils/cloudinaryUpload.ts").then(m => m.uploadBufferToCloudinary(buffer, `admin/${field}`));
                    // Delete old image if it exists and wasn't default
                    const oldUrl = existingHospital[field];
                    if (oldUrl) {
                        const publicId = extractPublicId(oldUrl);
                        if (publicId) {
                            await cloudinary.uploader.destroy(publicId);
                        }
                    }
                    // Update data with new URL
                    updateData[field] = newUrl;
                }
                catch (error) {
                    console.error(`Failed to upload ${field}:`, error);
                    throw { status: StatusCode.INTERNAL_SERVER_ERROR, message: `Failed to upload ${field}` };
                }
            }
            else if (updateData[field] === '' && existingHospital[field]) {
                // Handle image deletion if set to empty string
                const oldUrl = existingHospital[field];
                const publicId = extractPublicId(oldUrl);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }
        }
        return await this._adminRepo.update(id, updateData);
    }
    async getAllDoctors(options) {
        const { page, limit, search, filter } = options;
        return await this._doctorRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "email", "qualification", "department"],
            filter
        });
    }
    async toggleDoctorStatus(id) {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            throw { status: StatusCode.NOT_FOUND, message: MESSAGES.DOCTOR.NOT_FOUND };
        }
        const newStatus = !doctor.isActive;
        return await this._doctorRepo.update(id, { isActive: newStatus });
    }
    async acceptDoctor(id) {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            throw { status: StatusCode.NOT_FOUND, message: MESSAGES.DOCTOR.NOT_FOUND };
        }
        return await this._doctorRepo.update(id, {
            isActive: true,
            reviewStatus: "approved",
            isAccountVerified: true
        });
    }
    async rejectDoctor(id, reason) {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            throw { status: StatusCode.NOT_FOUND, message: MESSAGES.DOCTOR.NOT_FOUND };
        }
        return await this._doctorRepo.update(id, {
            isActive: false,
            reviewStatus: "rejected",
            rejectionReason: reason
        });
    }
    async requestRevision(id, reason) {
        const doctor = await this._doctorRepo.findById(id);
        if (!doctor) {
            throw { status: StatusCode.NOT_FOUND, message: MESSAGES.DOCTOR.NOT_FOUND };
        }
        return await this._doctorRepo.update(id, {
            reviewStatus: "revision",
            rejectionReason: reason
        });
    }
    async reapplyHospital(id) {
        const hospital = await this._adminRepo.findById(id);
        if (!hospital) {
            throw { status: StatusCode.NOT_FOUND, message: "Hospital not found" };
        }
        return await this._adminRepo.update(id, {
            reviewStatus: 'pending',
            rejectionReason: null
        });
    }
}
