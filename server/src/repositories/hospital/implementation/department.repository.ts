import { Model } from "mongoose";
import { IDepartment } from "../../../models/department.model.ts";
import { BaseRepository } from "../../IBase/BaseRepository.ts";
import { IDepartmentRepository } from "../department.repository.interface.ts";

export class DepartmentRepository extends BaseRepository<IDepartment> implements IDepartmentRepository {
    constructor(model: Model<IDepartment>) {
        super(model);
    }

    async findByHospitalId(hospitalId: string, page: number = 1, limit: number = 6, search: string = ""): Promise<{ data: IDepartment[], total: number }> {
        const query: any = { hospital_id: hospitalId };

        if (search) {
            query.departmentName = { $regex: search, $options: "i" };
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.model.countDocuments(query).exec()
        ]);

        return { data, total };
    }
}
