import { DepartmentManagementController } from "../controllers/hospital/department/implementation/department.controller.ts";
import { DepartmentService } from "../services/hospital/department/implementations/department.service.ts";
import { DepartmentRepository } from "../repositories/hospital/implementation/department.repository.ts";
import DepartmentModel from "../models/department.model.ts";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.ts";

export const departmentContiner = () => {
    const departmentRepo = new DepartmentRepository(DepartmentModel);
    const imageService = new CloudinaryImageService();
    const departmentService = new DepartmentService(departmentRepo, imageService);
    const departmentManagement = new DepartmentManagementController(departmentService);

    return {
        departmentManagement
    };
};