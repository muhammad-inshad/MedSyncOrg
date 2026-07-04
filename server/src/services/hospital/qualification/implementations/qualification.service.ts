import { IQualification } from "../../../../models/qualification.model.ts";
import { IQualificationRepository } from "../../../../repositories/hospital/qualification.repository.interface.ts";
import { IQualificationService } from "../interfaces/qualification.service.interface.ts";
import { ICloudinaryImageService } from "../../../image/interfaces/cloudinary.service.interface.ts";
import { QualificationResponseDTO } from "../../../../dto/hospital/qualification-response.dto.ts";
import { QualificationMapper } from "../../../../mappers/qualification.mapper.ts";
import { Types } from "mongoose";
import { IQualificationFilter } from "../../../../types/hospital.types.ts";

export class QualificationService implements IQualificationService {
    constructor(
        private readonly _qualificationRepo: IQualificationRepository,
        private readonly _imageService: ICloudinaryImageService,
        private readonly _qualificationMapper: QualificationMapper
    ) { }

    async getQualifications(hospitalId: string, page: number, limit: number, search?: string,filter?: "active" | "blocked" | undefined): Promise<{ data: QualificationResponseDTO[]; total: number; page: number; limit: number }> {
       
        const query:IQualificationFilter = { hospital_id: new Types.ObjectId(hospitalId) };
        if (filter === "active") {
            query.isActive = true;
        } else if (filter === "blocked") {
            query.isActive = false;
        }


        const result = await this._qualificationRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "abbreviation", "description"],
            filter: query
        });
        return {
            ...result,
            data: result.data.map(q => this._qualificationMapper.toDTO(q as IQualification))
        };
    }

    async createQualification(hospitalId: string, data: Partial<IQualification>, file?: Express.Multer.File): Promise<QualificationResponseDTO> {
        const qualificationData: Partial<IQualification> = {
            ...data,
            hospital_id: new Types.ObjectId(hospitalId) as unknown as Types.ObjectId
        };

        if (file) {
            qualificationData.image = await this._imageService.uploadImage(file.buffer, "hospital/qualifications");
        } else if (data.image && data.image.startsWith('data:image')) {
            qualificationData.image = await this._imageService.uploadImage(data.image, "hospital/qualifications");
        }

        const created = await this._qualificationRepo.create(qualificationData);
        return this._qualificationMapper.toDTO(created);
    }

    async updateQualification(id: string, data: Partial<IQualification>, file?: Express.Multer.File): Promise<QualificationResponseDTO | null> {
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

        const updated = await this._qualificationRepo.update(id, updateData);
        return updated ? this._qualificationMapper.toDTO(updated) : null;
    }

    async toggleStatus(id: string): Promise<QualificationResponseDTO | null> {
        const qualification = await this._qualificationRepo.findById(id);
        if (!qualification) return null;
        const updated = await this._qualificationRepo.update(id, { isActive: !qualification.isActive });
        return updated ? this._qualificationMapper.toDTO(updated) : null;
    }
}
