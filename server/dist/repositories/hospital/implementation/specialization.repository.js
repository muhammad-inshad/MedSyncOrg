import { BaseRepository } from "../../IBase/BaseRepository.js";
import Specialization from "../../../models/specialization.model.js";
import { Types } from "mongoose";
export class SpecializationRepository extends BaseRepository {
    constructor() {
        super(Specialization);
    }
    async findByHospitalId(hospitalId) {
        return this.model.find({ hospital_id: new Types.ObjectId(hospitalId), isActive: true, });
    }
    async findByDepartmentId(departmentId) {
        return this.model.find({ department_id: new Types.ObjectId(departmentId), isActive: true, });
    }
}
