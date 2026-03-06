import { Model } from "mongoose";
import { IDepartment } from "../../../models/department.model.ts";
import { BaseRepository } from "../../IBase/BaseRepository.ts";
import { IDepartmentRepository } from "../department.repository.interface.ts";

export class DepartmentRepository extends BaseRepository<IDepartment> implements IDepartmentRepository {
    constructor(model: Model<IDepartment>) {
        super(model);
    }

    async findByHospitalId(hospitalId: string): Promise<IDepartment[]> {
        return await this.model.find({ hospital_id: hospitalId }).sort({ createdAt: -1 }).exec();
    }
}
