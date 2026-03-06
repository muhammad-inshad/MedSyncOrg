import { IDepartment } from "../../../../models/department.model.ts";

export interface IDepartmentService {
    getDepartments(hospitalId: string, page: number, limit: number, search?: string): Promise<{ data: IDepartment[]; total: number; page: number; limit: number }>;
    createDepartment(hospitalId: string, data: Partial<IDepartment>, file?: Express.Multer.File): Promise<IDepartment>;
    updateDepartment(id: string, data: Partial<IDepartment>, file?: Express.Multer.File): Promise<IDepartment | null>;
    toggleStatus(id: string): Promise<IDepartment | null>;
}
