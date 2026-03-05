import { MESSAGES } from "../../../../constants/messages.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";
import { IHospitalRepository } from "../../../../repositories/hospital/hospital.repository.interface.ts";
import { HospitalResponseDTO, IHospitalUpdateDTO } from "../../../../dto/hospital/hospital-response.dto.ts";
import { IHospitalService } from "../interfaces/hospital.services.interfaces.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HospitalMapper } from "../../../../mappers/hospital.mapper.ts";
import { IHospital } from "../../../../models/hospital.model.ts";
import Logger from "../../../../utils/logger.ts";
import bcrypt from "bcryptjs";
import { ICloudinaryImageService } from "../../../image/interfaces/cloudinary.service.interface.ts";

export class HospitalService implements IHospitalService {
    constructor(
        private readonly _hospitalRepo: IHospitalRepository,
        private readonly _hospitalMapper: HospitalMapper,
        private readonly _imageService: ICloudinaryImageService
    ) { }

    async getHospitalProfile(hospitalId: string): Promise<HospitalResponseDTO> {
        const hospital = await this._hospitalRepo.findById(hospitalId);

        if (!hospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.ADMIN.NOT_FOUND);
        }
        return this._hospitalMapper.toDTO(hospital!);
    }

    async updateHospitalStatusReapply(hospitalId: string): Promise<HospitalResponseDTO | null> {
        const updatedHospital = await this._hospitalRepo.update(hospitalId, {
            reviewStatus: "pending",
            rejectionReason: undefined
        } as Partial<IHospital>);
        return updatedHospital ? this._hospitalMapper.toDTO(updatedHospital) : null;
    }

    async updateHospital(
        hospitalId: string,
        hospitalData: IHospitalUpdateDTO,
        files?: { [fieldname: string]: Express.Multer.File[] }
    ): Promise<HospitalResponseDTO | null> {
        const hospital = await this._hospitalRepo.findById(hospitalId);
        if (!hospital) {
            Logger.warn(`Update Hospital failed: Hospital not found with ID ${hospitalId}`);
            return null;
        }

        const updatePayload: IHospitalUpdateDTO = { ...hospitalData };

        // 1. Password Handling
        if (updatePayload.password && updatePayload.password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updatePayload.password = await bcrypt.hash(updatePayload.password, salt);
        } else {
            delete updatePayload.password;
        }
        delete updatePayload.confirmPassword;

        // 2. Data Parsing (as they come from FormData as strings)
        try {
            if (typeof hospitalData.subscription === 'string') {
                updatePayload.subscription = JSON.parse(hospitalData.subscription);
            }
            if (typeof hospitalData.images === 'string') {
                updatePayload.images = JSON.parse(hospitalData.images);
            }
            if (typeof hospitalData.since === 'string') {
                updatePayload.since = parseInt(hospitalData.since, 10);
            }
        } catch (e) {
            Logger.error("Failed to parse nested JSON fields in Hospital Update", e);
        }

        const currentImages = hospital.images || {
            landscape: [],
            medicalTeam: [],
            patientCare: [],
            services: []
        };

        const desiredImages = (updatePayload.images as IHospital['images']) || currentImages;

        if (typeof updatePayload.logo === 'string' && updatePayload.logo.startsWith('data:image')) {
            if (hospital.logo) await this._imageService.deleteImage(hospital.logo);
            updatePayload.logo = await this._imageService.uploadImage(updatePayload.logo, "hospitals/logos");
        } else if (updatePayload.logo === "" && hospital.logo) {
            await this._imageService.deleteImage(hospital.logo);
            updatePayload.logo = "";
        } else if (files?.logo?.[0]) {
            if (hospital.logo) await this._imageService.deleteImage(hospital.logo);
            updatePayload.logo = await this._imageService.uploadImage(files.logo[0].buffer, "hospitals/logos");
        }

        if (typeof updatePayload.licence === 'string' && updatePayload.licence.startsWith('data:image')) {
            if (hospital.licence) await this._imageService.deleteImage(hospital.licence);
            updatePayload.licence = await this._imageService.uploadImage(updatePayload.licence, "hospitals/licenses");
        } else if (updatePayload.licence === "" && hospital.licence) {
            await this._imageService.deleteImage(hospital.licence);
            updatePayload.licence = "";
        } else if (files?.licence?.[0]) {
            if (hospital.licence) await this._imageService.deleteImage(hospital.licence);
            updatePayload.licence = await this._imageService.uploadImage(files.licence[0].buffer, "hospitals/licenses");
        }

        const categories = ['landscape', 'medicalTeam', 'patientCare', 'services'] as const;
        updatePayload.images = { ...currentImages };

        for (const category of categories) {
            const currentUrls = currentImages[category] || [];
            const desiredState = desiredImages[category] || [];
            let finalState = [...desiredState];
            if (files?.[category]) {
                const uploadedUrls = await Promise.all(
                    files[category].map(file => this._imageService.uploadImage(file.buffer, `hospitals/gallery/${category}`))
                );
                finalState = [...finalState, ...uploadedUrls];
            }

            updatePayload.images[category] = await this._imageService.processGalleryUpdate(
                currentUrls,
                finalState,
                `hospitals/gallery/${category}`
            );
        }

        if (updatePayload.isActive !== undefined) {
            updatePayload.isActive = String(updatePayload.isActive) === 'true' || updatePayload.isActive === true;
        }

        Logger.info(`Updating hospital profile for ID: ${hospitalId}`);
        const updatedHospital = await this._hospitalRepo.update(hospitalId, updatePayload as Partial<IHospital>);

        return updatedHospital ? this._hospitalMapper.toDTO(updatedHospital) : null;
    }
}
