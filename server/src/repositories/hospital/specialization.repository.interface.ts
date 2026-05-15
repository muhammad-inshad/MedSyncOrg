import { IBaseRepository } from "../IBase/IBaseRepository.interface.js";
import { ISpecialization } from "../../models/specialization.model.js";


export interface ISpecializationRepository extends IBaseRepository<ISpecialization> {
    findByHospitalId(hospitalId: string): Promise<ISpecialization[]>;
    findByDepartmentId(departmentId: string): Promise<ISpecialization[]>;
}
