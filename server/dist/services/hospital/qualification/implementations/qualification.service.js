import { Types } from "mongoose";
export class QualificationService {
    constructor(_qualificationRepo, _imageService, _qualificationMapper) {
        this._qualificationRepo = _qualificationRepo;
        this._imageService = _imageService;
        this._qualificationMapper = _qualificationMapper;
    }
    async getQualifications(hospitalId, page, limit, search, filter) {
        const query = { hospital_id: new Types.ObjectId(hospitalId) };
        if (filter === "active") {
            query.isActive = true;
        }
        else if (filter === "blocked") {
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
            data: result.data.map(q => this._qualificationMapper.toDTO(q))
        };
    }
    async createQualification(hospitalId, data, file) {
        const qualificationData = {
            ...data,
            hospital_id: new Types.ObjectId(hospitalId)
        };
        if (file) {
            qualificationData.image = await this._imageService.uploadImage(file.buffer, "hospital/qualifications");
        }
        else if (data.image && data.image.startsWith('data:image')) {
            qualificationData.image = await this._imageService.uploadImage(data.image, "hospital/qualifications");
        }
        const created = await this._qualificationRepo.create(qualificationData);
        return this._qualificationMapper.toDTO(created);
    }
    async updateQualification(id, data, file) {
        const qualification = await this._qualificationRepo.findById(id);
        if (!qualification)
            return null;
        const updateData = { ...data };
        if (file) {
            if (qualification.image)
                await this._imageService.deleteImage(qualification.image);
            updateData.image = await this._imageService.uploadImage(file.buffer, "hospital/qualifications");
        }
        else if (data.image && data.image.startsWith('data:image')) {
            if (qualification.image)
                await this._imageService.deleteImage(qualification.image);
            updateData.image = await this._imageService.uploadImage(data.image, "hospital/qualifications");
        }
        else if (data.image === "" && qualification.image) {
            await this._imageService.deleteImage(qualification.image);
            updateData.image = "";
        }
        const updated = await this._qualificationRepo.update(id, updateData);
        return updated ? this._qualificationMapper.toDTO(updated) : null;
    }
    async toggleStatus(id) {
        const qualification = await this._qualificationRepo.findById(id);
        if (!qualification)
            return null;
        const updated = await this._qualificationRepo.update(id, { isActive: !qualification.isActive });
        return updated ? this._qualificationMapper.toDTO(updated) : null;
    }
}
