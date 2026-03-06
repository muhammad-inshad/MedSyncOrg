import { IQualification } from "../../../../models/qualification.model.ts";
import { IQualificationRepository } from "../../../../repositories/hospital/qualification.repository.interface.ts";
import { IQualificationService } from "../interfaces/qualification.service.interface.ts";
import { ICloudinaryImageService } from "../../../image/interfaces/cloudinary.service.interface.ts";
import { Types } from "mongoose";

export class QualificationService implements IQualificationService {
    constructor(
        private readonly _qualificationRepo: IQualificationRepository,
        private readonly _imageService: ICloudinaryImageService
    ) { }

    async getQualifications(hospitalId: string, page: number, limit: number, search?: string): Promise<{ data: IQualification[]; total: number; page: number; limit: number }> {
        return await this._qualificationRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "abbreviation", "description"],
            filter: { hospital_id: new Types.ObjectId(hospitalId) }
        });
    }

    async createQualification(hospitalId: string, data: Partial<IQualification>, file?: Express.Multer.File): Promise<IQualification> {
        const qualificationData: Partial<IQualification> = {
            ...data,
            hospital_id: new Types.ObjectId(hospitalId) as unknown as Types.ObjectId
        };

        if (file) {
            qualificationData.image = await this._imageService.uploadImage(file.buffer, "hospital/qualifications");
        } else if (data.image && data.image.startsWith('data:image')) {
            qualificationData.image = await this._imageService.uploadImage(data.image, "hospital/qualifications");
        }

        return await this._qualificationRepo.create(qualificationData);
    }

    async updateQualification(id: string, data: Partial<IQualification>, file?: Express.Multer.File): Promise<IQualification | null> {
        const qualification = await this._qualificationRepo.findById(id);
        if (!qualification) return null;

        const updateData = { ...data };

        if (file) {
            if (qualification.image) await this._imageService.deleteImage(qualification.image);
            updateData.image = await this._imageService.uploadImage(file.buffer, "hospital/qualifications");
        } else if (data.image && data.image.startsWith('data:image')) {
            if (qualification.image) await this._imageService.deleteImage(qualification.image);
            updateData.image = await this._imageService.uploadImage(data.image, "hospital/qualifications");
        } else if (data.image === "" && qualification.image) {
            await this._imageService.deleteImage(qualification.image);
            updateData.image = "";
        }

        return await this._qualificationRepo.update(id, updateData);
    }

    async toggleStatus(id: string): Promise<IQualification | null> {
        const qualification = await this._qualificationRepo.findById(id);
        if (!qualification) return null;
        return await this._qualificationRepo.update(id, { isActive: !qualification.isActive });
    }
}
