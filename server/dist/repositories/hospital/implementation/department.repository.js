import { Types } from "mongoose";
import { BaseRepository } from "../../IBase/BaseRepository.js";
export class DepartmentRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
    async findByHospitalId(hospitalId, page = 1, limit = 6, search = "") {
        const query = {
            hospital_id: new Types.ObjectId(hospitalId),
            isActive: true,
        };
        if (search) {
            query.$or = [
                { departmentName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.model.countDocuments(query).exec()
        ]);
        return { data, total };
    }
}
