import { ISpecialization } from "../../../../models/specialization.model.js";
import { ISpecializationRepository } from "../../../../repositories/hospital/specialization.repository.interface.js";
import { ISpecializationService } from "../interfaces/specialization.service.interface.js";
import { ICloudinaryImageService } from "../../../image/interfaces/cloudinary.service.interface.js";
import { SpecializationResponseDTO } from "../../../../dto/hospital/specialization-response.dto.js";
import { SpecializationMapper } from "../../../../mappers/specialization.mapper.js";
import { Types } from "mongoose";
import { IDepartmentFilter } from "../../../../types/hospital.types.js";

export class SpecializationService implements ISpecializationService {
    constructor(
        private readonly _specializationRepo: ISpecializationRepository,
        private readonly _imageService: ICloudinaryImageService,
        private readonly _specializationMapper: SpecializationMapper
    ) { }

    async getSpecializations(
        hospitalId: string,
        params: { page: number; limit: number; search?: string; filter?: "active" | "blocked" | undefined }
    ): Promise<{ data: SpecializationResponseDTO[]; total: number; limit: number; page: number, }> {
        const { page, limit, search, filter } = params;
        const query: IDepartmentFilter = { hospital_id: new Types.ObjectId(hospitalId) };
        if (filter === "active") {
            query.isActive = true;
        } else if (filter === "blocked") {
            query.isActive = false;
        }
        const result = await this._specializationRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "description"],
            filter: query,
        });

        return {
            ...result,
            data: result.data.map(s => this._specializationMapper.toDTO(s as ISpecialization))
        };
    }

    async createSpecialization(
        hospitalId: string,
        specializationData: Partial<ISpecialization>,
        file?: Express.Multer.File
    ): Promise<SpecializationResponseDTO> {
        const data: Partial<ISpecialization> = {
            ...specializationData,
            hospital_id: new Types.ObjectId(hospitalId),
        };

        if (file) {
            data.image = await this._imageService.uploadImage(file.buffer, "hospital/specializations");
        } else if (specializationData.image && specializationData.image.startsWith("data:image")) {
            data.image = await this._imageService.uploadImage(specializationData.image, "hospital/specializations");
        }

        const created = await this._specializationRepo.create(data);
        return this._specializationMapper.toDTO(created);
    }

    async updateSpecialization(
        id: string,
        specializationData: Partial<ISpecialization>,
        file?: Express.Multer.File
    ): Promise<SpecializationResponseDTO | null> {
        const specialization = await this._specializationRepo.findById(id);
        if (!specialization) return null;

        const updateData: Partial<ISpecialization> = { ...specializationData };

        if (file) {
            if (specialization.image) await this._imageService.deleteImage(specialization.image);
            updateData.image = await this._imageService.uploadImage(file.buffer, "hospital/specializations");
        } else if (specializationData.image && specializationData.image.startsWith("data:image")) {
            if (specialization.image) await this._imageService.deleteImage(specialization.image);
            updateData.image = await this._imageService.uploadImage(specializationData.image, "hospital/specializations");
        } else if (specializationData.image === "" && specialization.image) {
            await this._imageService.deleteImage(specialization.image);
            updateData.image = "";
        }

        const updated = await this._specializationRepo.update(id, updateData);
        return updated ? this._specializationMapper.toDTO(updated) : null;
    }

    async toggleStatus(id: string): Promise<SpecializationResponseDTO | null> {
        const specialization = await this._specializationRepo.findById(id);
        if (!specialization) return null;
        const updated = await this._specializationRepo.update(id, { isActive: !specialization.isActive });
        return updated ? this._specializationMapper.toDTO(updated) : null;
    }
  
}
