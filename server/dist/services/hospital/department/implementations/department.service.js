import { Types } from "mongoose";
export class DepartmentService {
    constructor(_departmentRepo, _imageService, _subscriptionService, _departmentMapper) {
        this._departmentRepo = _departmentRepo;
        this._imageService = _imageService;
        this._subscriptionService = _subscriptionService;
        this._departmentMapper = _departmentMapper;
    }
    async getDepartments(hospitalId, page, limit, search, filter) {
        const query = {
            hospital_id: new Types.ObjectId(hospitalId),
        };
        if (filter === "active") {
            query.isActive = true;
        }
        else if (filter === "blocked") {
            query.isActive = false;
        }
        const res = await this._departmentRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["departmentName", "description"],
            filter: query
        });
        return {
            ...res,
            data: res.data.map(dept => this._departmentMapper.toDTO(dept))
        };
    }
    async createDepartment(hospitalId, data, file) {
        await this._subscriptionService.checkSubscriptionLimit(hospitalId, "maxDepartments");
        const departmentData = {
            ...data,
            hospital_id: new Types.ObjectId(hospitalId)
        };
        if (file) {
            departmentData.image = await this._imageService.uploadImage(file.buffer, "hospital/departments");
        }
        else if (data.image && data.image.startsWith('data:image')) {
            departmentData.image = await this._imageService.uploadImage(data.image, "hospital/departments");
        }
        const created = await this._departmentRepo.create(departmentData);
        return this._departmentMapper.toDTO(created);
    }
    async updateDepartment(id, data, file) {
        const department = await this._departmentRepo.findById(id);
        if (!department)
            return null;
        const updateData = { ...data };
        if (file) {
            if (department.image)
                await this._imageService.deleteImage(department.image);
            updateData.image = await this._imageService.uploadImage(file.buffer, "hospital/departments");
        }
        else if (data.image && data.image.startsWith('data:image')) {
            if (department.image)
                await this._imageService.deleteImage(department.image);
            updateData.image = await this._imageService.uploadImage(data.image, "hospital/departments");
        }
        else if (data.image === "" && department.image) {
            await this._imageService.deleteImage(department.image);
            updateData.image = "";
        }
        const updated = await this._departmentRepo.update(id, updateData);
        return updated ? this._departmentMapper.toDTO(updated) : null;
    }
    async toggleStatus(id) {
        const department = await this._departmentRepo.findById(id);
        if (!department)
            return null;
        const updated = await this._departmentRepo.update(id, { isActive: !department.isActive });
        return updated ? this._departmentMapper.toDTO(updated) : null;
    }
}
