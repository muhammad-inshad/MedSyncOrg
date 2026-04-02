import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";
import { ISpecialization } from "../../models/specialization.model.ts";


export interface ISpecializationRepository extends IBaseRepository<ISpecialization> {
    findByHospitalId(hospitalId: string): Promise<ISpecialization[]>;
    findByDepartmentId(departmentId: string): Promise<ISpecialization[]>;
}
