import { DepartmentResponseDTO } from "../../../../dto/hospital/department-response.dto.ts";
import { IDepartment } from "../../../../models/department.model.ts";

export interface IDepartmentService {
    getDepartments(hospitalId: string, page: number, limit: number, search?: string): Promise<{ data: DepartmentResponseDTO[]; total: number; page: number; limit: number }>;
    createDepartment(hospitalId: string, data: Partial<IDepartment>, file?: Express.Multer.File): Promise<DepartmentResponseDTO>;
    updateDepartment(id: string, data: Partial<IDepartment>, file?: Express.Multer.File): Promise<DepartmentResponseDTO | null>;
    toggleStatus(id: string): Promise<DepartmentResponseDTO | null>;
}
