import { BaseRepository } from "../../IBase/BaseRepository.js";
import { ISpecialization } from "../../../models/specialization.model.js";
import { ISpecializationRepository } from "../specialization.repository.interface.js";
import Specialization from "../../../models/specialization.model.js";
import { Types } from "mongoose";

export class SpecializationRepository extends BaseRepository<ISpecialization> implements ISpecializationRepository {
    constructor() {
        super(Specialization);
    }

    async findByHospitalId(hospitalId: string): Promise<ISpecialization[]> {
        return this.model.find({ hospital_id: new Types.ObjectId(hospitalId), isActive: true,});
    }

    async findByDepartmentId(departmentId: string): Promise<ISpecialization[]> {
        return this.model.find({ department_id: new Types.ObjectId(departmentId), isActive: true, });
    }
}
