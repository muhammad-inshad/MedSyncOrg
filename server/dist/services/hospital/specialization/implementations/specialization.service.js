import { Types } from "mongoose";
export class SpecializationService {
    constructor(_specializationRepo, _imageService, _specializationMapper) {
        this._specializationRepo = _specializationRepo;
        this._imageService = _imageService;
        this._specializationMapper = _specializationMapper;
    }
    async getSpecializations(hospitalId, params) {
        const { page, limit, search, filter } = params;
        const query = { hospital_id: new Types.ObjectId(hospitalId) };
        if (filter === "active") {
            query.isActive = true;
        }
        else if (filter === "blocked") {
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
            data: result.data.map(s => this._specializationMapper.toDTO(s))
        };
    }
    async createSpecialization(hospitalId, specializationData, file) {
        const data = {
            ...specializationData,
            hospital_id: new Types.ObjectId(hospitalId),
        };
        if (file) {
            data.image = await this._imageService.uploadImage(file.buffer, "hospital/specializations");
        }
        else if (specializationData.image && specializationData.image.startsWith("data:image")) {
            data.image = await this._imageService.uploadImage(specializationData.image, "hospital/specializations");
        }
        const created = await this._specializationRepo.create(data);
        return this._specializationMapper.toDTO(created);
    }
    async updateSpecialization(id, specializationData, file) {
        const specialization = await this._specializationRepo.findById(id);
        if (!specialization)
            return null;
        const updateData = { ...specializationData };
        if (file) {
            if (specialization.image)
                await this._imageService.deleteImage(specialization.image);
            updateData.image = await this._imageService.uploadImage(file.buffer, "hospital/specializations");
        }
        else if (specializationData.image && specializationData.image.startsWith("data:image")) {
            if (specialization.image)
                await this._imageService.deleteImage(specialization.image);
            updateData.image = await this._imageService.uploadImage(specializationData.image, "hospital/specializations");
        }
        else if (specializationData.image === "" && specialization.image) {
            await this._imageService.deleteImage(specialization.image);
            updateData.image = "";
        }
        const updated = await this._specializationRepo.update(id, updateData);
        return updated ? this._specializationMapper.toDTO(updated) : null;
    }
    async toggleStatus(id) {
        const specialization = await this._specializationRepo.findById(id);
        if (!specialization)
            return null;
        const updated = await this._specializationRepo.update(id, { isActive: !specialization.isActive });
        return updated ? this._specializationMapper.toDTO(updated) : null;
    }
}
