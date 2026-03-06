import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IDoctor } from "../../models/doctor.model.ts";
import { IDoctorRepository } from "./doctor.repository.interface.ts";


export class DoctorRepository extends BaseRepository<IDoctor> implements IDoctorRepository {
    async countByDepartment(hospitalId: string, departmentId: string): Promise<number> {
        return await this.model.countDocuments({
            hospital_id: hospitalId,
            department: departmentId,
            isActive: true,
            reviewStatus: "approved"
        }).exec();
    }
}
