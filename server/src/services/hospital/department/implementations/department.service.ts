import { IDepartment } from "../../../../models/department.model.ts";
import { IDepartmentRepository } from "../../../../repositories/hospital/department.repository.interface.ts";
import { IDepartmentService } from "../interfaces/department.service.interface.ts";
import { ICloudinaryImageService } from "../../../image/interfaces/cloudinary.service.interface.ts";
import { Types } from "mongoose";
import { IHospitalSubscriptionService } from "../../subscription/interfaces/subscription.service.interface.ts";
import { DepartmentResponseDTO } from "../../../../dto/hospital/department-response.dto.ts";
import { DepartmentMapper } from "../../../../mappers/department.mapper.ts";

export class DepartmentService implements IDepartmentService {
    constructor(
        private readonly _departmentRepo: IDepartmentRepository,
        private readonly _imageService: ICloudinaryImageService,
        private readonly _subscriptionService: IHospitalSubscriptionService,
        private readonly _departmentMapper: DepartmentMapper
    ) { }

    async getDepartments(hospitalId: string, page: number, limit: number, search?: string): Promise<{ data: DepartmentResponseDTO[]; total: number; page: number; limit: number }> {
        const res = await this._departmentRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["departmentName", "description"],
            filter: { hospital_id: new Types.ObjectId(hospitalId) }
        });

        return {
            ...res,
            data: res.data.map(dept => this._departmentMapper.toDTO(dept))
        };
    }

    async createDepartment(hospitalId: string, data: Partial<IDepartment>, file?: Express.Multer.File): Promise<DepartmentResponseDTO> {
        await this._subscriptionService.checkSubscriptionLimit(hospitalId, "maxDepartments");

        const departmentData: Partial<IDepartment> = {
            ...data,
            hospital_id: new Types.ObjectId(hospitalId) as unknown as Types.ObjectId
        };

        if (file) {
            departmentData.image = await this._imageService.uploadImage(file.buffer, "hospital/departments");
        } else if (data.image && data.image.startsWith('data:image')) {
            departmentData.image = await this._imageService.uploadImage(data.image, "hospital/departments");
        }

        const created = await this._departmentRepo.create(departmentData);
        return this._departmentMapper.toDTO(created);
    }

    async updateDepartment(id: string, data: Partial<IDepartment>, file?: Express.Multer.File): Promise<DepartmentResponseDTO | null> {
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

        const updated = await this._departmentRepo.update(id, updateData);
        return updated ? this._departmentMapper.toDTO(updated) : null;
    }

    async toggleStatus(id: string): Promise<DepartmentResponseDTO | null> {
        const department = await this._departmentRepo.findById(id);
        if (!department) return null;
        const updated = await this._departmentRepo.update(id, { isActive: !department.isActive });
        return updated ? this._departmentMapper.toDTO(updated) : null;
    }
}
