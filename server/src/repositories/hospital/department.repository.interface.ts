import { IDepartment } from "../../models/department.model.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export interface IDepartmentRepository extends IBaseRepository<IDepartment> {
    findByHospitalId(hospitalId: string): Promise<IDepartment[]>;
}
