import { IDoctor } from "../../models/doctor.model.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";


export interface IDoctorRepository extends IBaseRepository<IDoctor> {
    countByDepartment(hospitalId: string, departmentId: string): Promise<number>;
    countActiveDoctor(hospitalId: string): Promise<number>;
    countBlockedDoctor(hospitalId: string): Promise<number>;
    countPendingDoctor(hospitalId: string): Promise<number>;
    
}