import { IDepartment } from "../../../../models/department.model.ts";

export interface IDepartmentService {
    getDepartments(hospitalId: string): Promise<IDepartment[]>;
    createDepartment(hospitalId: string, data: Partial<IDepartment>, file?: Express.Multer.File): Promise<IDepartment>;
    updateDepartment(id: string, data: Partial<IDepartment>, file?: Express.Multer.File): Promise<IDepartment | null>;
    toggleStatus(id: string): Promise<IDepartment | null>;
}
