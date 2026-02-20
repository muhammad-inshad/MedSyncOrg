import { AdminRepository } from "../repositories/admin/admin.repository.ts";
import { TokenService } from "./token.service.ts";
import cloudinary from "../config/cloudinary.ts";
import { extractPublicId } from "../utils/cloudinaryUpload.ts";
import { IDoctorRepository } from "../repositories/doctor/doctor.repository.interface.ts";
import { StatusCode } from "../constants/statusCodes.ts";
import { MESSAGES } from "../constants/messages.ts";
import { IDoctorManagementService } from "../interfaces/IDoctorManagementService.ts";
import Logger from "../utils/logger.ts";

export class DoctorManagementService implements IDoctorManagementService {
  private readonly _adminRepo: AdminRepository;
  private readonly _tokenService: TokenService;
  private readonly _doctorRepo: IDoctorRepository;

  constructor(
    adminRepo: AdminRepository,
    tokenService: TokenService,
    doctorRepo: IDoctorRepository
  ) {
    this._adminRepo = adminRepo;
    this._tokenService = tokenService;
    this._doctorRepo = doctorRepo;
  }

  async updateHospital(id: string, updateData: any) {
    const existingHospital = await this._adminRepo.findById(id);
    if (!existingHospital) {
      Logger.warn(`Update Hospital failed: Hospital not found with ID ${id}`);
      throw { status: StatusCode.NOT_FOUND, message: "Hospital not found" };
    }

    const imagesToProcess = ["logo", "licence"] as const;

    for (const field of imagesToProcess) {
      if (updateData[field] && updateData[field].startsWith('data:image')) {
        try {
          // Upload new image
          const base64Data = updateData[field].split(';base64,').pop();
          const buffer = Buffer.from(base64Data, 'base64');
          const newUrl = await import("../utils/cloudinaryUpload.ts").then(m =>
            m.uploadBufferToCloudinary(buffer, `admin/${field}`)
          );

          // Delete old image if it exists and wasn't default
          const oldUrl = (existingHospital as any)[field];
          if (oldUrl) {
            const publicId = extractPublicId(oldUrl);
            if (publicId) {
              await cloudinary.uploader.destroy(publicId);
            }
          }

          // Update data with new URL
          updateData[field] = newUrl;
        } catch (error) {
          Logger.error(`Failed to upload ${field}: ${error}`);
          throw { status: StatusCode.INTERNAL_SERVER_ERROR, message: `Failed to upload ${field}` };
        }
      } else if (updateData[field] === '' && (existingHospital as any)[field]) {
        // Handle image deletion if set to empty string
        const oldUrl = (existingHospital as any)[field];
        const publicId = extractPublicId(oldUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }
    Logger.info(`Hospital updated: ${id}`);
    return await this._adminRepo.update(id, updateData);
  }

  async getAllDoctors(options: { page: number; limit: number; search?: string; filter?: object }) {
    const { page, limit, search, filter } = options;
    return await this._doctorRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["name", "email", "qualification", "department"],
      filter
    });
  }

  async toggleDoctorStatus(id: string) {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      Logger.warn(`Toggle Status failed: Doctor not found with ID ${id}`);
      throw { status: StatusCode.NOT_FOUND, message: MESSAGES.DOCTOR.NOT_FOUND };
    }
    const newStatus = !doctor.isActive;
    Logger.info(`Doctor status toggled: ${id} -> ${newStatus}`);
    return await this._doctorRepo.update(id, { isActive: newStatus } as any);
  }

  async acceptDoctor(id: string) {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      Logger.warn(`Accept Doctor failed: Doctor not found with ID ${id}`);
      throw { status: StatusCode.NOT_FOUND, message: MESSAGES.DOCTOR.NOT_FOUND };
    }

    Logger.info(`Doctor accepted: ${id}`);
    return await this._doctorRepo.update(id, {
      isActive: true,
      reviewStatus: "approved",
      isAccountVerified: true
    } as any);
  }

  async rejectDoctor(id: string, reason: string) {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      Logger.warn(`Reject Doctor failed: Doctor not found with ID ${id}`);
      throw { status: StatusCode.NOT_FOUND, message: MESSAGES.DOCTOR.NOT_FOUND };
    }

    Logger.info(`Doctor rejected: ${id}, Reason: ${reason}`);
    return await this._doctorRepo.update(id, {
      isActive: false,
      reviewStatus: "rejected",
      rejectionReason: reason
    } as any);
  }

  async requestRevision(id: string, reason: string) {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      Logger.warn(`Request Revision failed: Doctor not found with ID ${id}`);
      throw { status: StatusCode.NOT_FOUND, message: MESSAGES.DOCTOR.NOT_FOUND };
    }

    Logger.info(`Doctor revision requested: ${id}, Reason: ${reason}`);
    return await this._doctorRepo.update(id, {
      reviewStatus: "revision",
      rejectionReason: reason
    } as any);
  }

  async reapplyHospital(id: string) {
    const hospital = await this._adminRepo.findById(id);
    if (!hospital) {
      Logger.warn(`Reapply Hospital failed: Hospital not found with ID ${id}`);
      throw { status: StatusCode.NOT_FOUND, message: "Hospital not found" };
    }

    Logger.info(`Hospital reapplied: ${id}`);
    return await this._adminRepo.update(id, {
      reviewStatus: 'pending',
      rejectionReason: null
    } as any);
  }
}