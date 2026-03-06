import { IDoctor } from "../../models/doctor.model.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";


export interface IDoctorRepository extends IBaseRepository<IDoctor> {
    countByDepartment(hospitalId: string, departmentId: string): Promise<number>;
}