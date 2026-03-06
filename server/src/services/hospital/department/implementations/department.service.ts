import { IDepartment } from "../../../../models/department.model.ts";
import { IDepartmentRepository } from "../../../../repositories/hospital/department.repository.interface.ts";
import { IDepartmentService } from "../interfaces/department.service.interface.ts";
import { ICloudinaryImageService } from "../../../image/interfaces/cloudinary.service.interface.ts";
import { Types } from "mongoose";

export class DepartmentService implements IDepartmentService {
    constructor(
        private readonly _departmentRepo: IDepartmentRepository,
        private readonly _imageService: ICloudinaryImageService
    ) { }

    async getDepartments(hospitalId: string, page: number, limit: number, search?: string): Promise<{ data: IDepartment[]; total: number; page: number; limit: number }> {
        return await this._departmentRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["departmentName", "description"],
            filter: { hospital_id: new Types.ObjectId(hospitalId) }
        });
    }

    async createDepartment(hospitalId: string, data: Partial<IDepartment>, file?: Express.Multer.File): Promise<IDepartment> {
        const departmentData: Partial<IDepartment> = {
            ...data,
            hospital_id: new Types.ObjectId(hospitalId) as unknown as Types.ObjectId
        };

        if (file) {
            departmentData.image = await this._imageService.uploadImage(file.buffer, "hospital/departments");
        } else if (data.image && data.image.startsWith('data:image')) {
            departmentData.image = await this._imageService.uploadImage(data.image, "hospital/departments");
        }

        return await this._departmentRepo.create(departmentData);
    }

    async updateDepartment(id: string, data: Partial<IDepartment>, file?: Express.Multer.File): Promise<IDepartment | null> {
        const department = await this._departmentRepo.findById(id);
        if (!department) return null;

        const updateData = { ...data };

        if (file) {
            if (department.image) await this._imageService.deleteImage(department.image);
            updateData.image = await this._imageService.uploadImage(file.buffer, "hospital/departments");
        } else if (data.image && data.image.startsWith('data:image')) {
            if (department.image) await this._imageService.deleteImage(department.image);
            updateData.image = await this._imageService.uploadImage(data.image, "hospital/departments");
        } else if (data.image === "" && department.image) {
            await this._imageService.deleteImage(department.image);
            updateData.image = "";
        }

        return await this._departmentRepo.update(id, updateData);
    }

    async toggleStatus(id: string): Promise<IDepartment | null> {
        const department = await this._departmentRepo.findById(id);
        if (!department) return null;
        return await this._departmentRepo.update(id, { isActive: !department.isActive });
    }
}
