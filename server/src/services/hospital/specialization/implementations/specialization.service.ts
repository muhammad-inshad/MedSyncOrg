import { ISpecialization } from "../../../../models/specialization.model.ts";
import { ISpecializationRepository } from "../../../../repositories/hospital/specialization.repository.interface.ts";
import { ISpecializationService } from "../interfaces/specialization.service.interface.ts";
import { ICloudinaryImageService } from "../../../image/interfaces/cloudinary.service.interface.ts";
import { Types } from "mongoose";

export class SpecializationService implements ISpecializationService {
    constructor(
        private readonly _specializationRepo: ISpecializationRepository,
        private readonly _imageService: ICloudinaryImageService
    ) { }

    async getSpecializations(
        hospitalId: string,
        params: { page: number; limit: number; search?: string }
    ): Promise<{ data: ISpecialization[]; total: number; limit: number; page: number }> {
        const { page, limit, search } = params;
        return await this._specializationRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "description"],
            filter: { hospital_id: new Types.ObjectId(hospitalId) },
        });
    }

    async createSpecialization(
        hospitalId: string,
        specializationData: Partial<ISpecialization>,
        file?: Express.Multer.File
    ): Promise<ISpecialization> {
        const data: Partial<ISpecialization> = {
            ...specializationData,
            hospital_id: new Types.ObjectId(hospitalId) as any,
        };

        if (file) {
            data.image = await this._imageService.uploadImage(file.buffer, "hospital/specializations");
        } else if (specializationData.image && specializationData.image.startsWith("data:image")) {
            data.image = await this._imageService.uploadImage(specializationData.image, "hospital/specializations");
        }

        return await this._specializationRepo.create(data);
    }

    async updateSpecialization(
        id: string,
        specializationData: Partial<ISpecialization>,
        file?: Express.Multer.File
    ): Promise<ISpecialization | null> {
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

        return await this._specializationRepo.update(id, updateData);
    }

    async toggleStatus(id: string): Promise<ISpecialization | null> {
        const specialization = await this._specializationRepo.findById(id);
        if (!specialization) return null;
        return await this._specializationRepo.update(id, { isActive: !specialization.isActive });
    }
}
