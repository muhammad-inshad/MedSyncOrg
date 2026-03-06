import { BaseRepository } from "../../IBase/BaseRepository.ts";
import { ISpecialization } from "../../../models/specialization.model.ts";
import { ISpecializationRepository } from "../specialization.repository.interface.ts";
import Specialization from "../../../models/specialization.model.ts";
import { Types } from "mongoose";

export class SpecializationRepository extends BaseRepository<ISpecialization> implements ISpecializationRepository {
    constructor() {
        super(Specialization);
    }

    async findByHospitalId(hospitalId: string): Promise<ISpecialization[]> {
        return this.model.find({ hospital_id: new Types.ObjectId(hospitalId) });
    }

    async findByDepartmentId(departmentId: string): Promise<ISpecialization[]> {
        return this.model.find({ department_id: new Types.ObjectId(departmentId) });
    }
}
