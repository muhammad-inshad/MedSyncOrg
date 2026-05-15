import { IDepartment } from "../../models/department.model.js";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.js";

export interface IDepartmentRepository extends IBaseRepository<IDepartment> {
    findByHospitalId(hospitalId: string, page?: number, limit?: number, search?: string): Promise<{ data: IDepartment[], total: number }>;
}
