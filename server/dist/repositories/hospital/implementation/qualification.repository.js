import { BaseRepository } from "../../IBase/BaseRepository.js";
export class QualificationRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
    async findByHospitalId(hospitalId) {
        return await this.model.find({ hospital_id: hospitalId, isActive: true, }).sort({ createdAt: -1 }).exec();
    }
}
