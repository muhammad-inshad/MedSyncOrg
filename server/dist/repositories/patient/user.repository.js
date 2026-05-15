import { BaseRepository } from "../IBase/BaseRepository.js";
export class UserRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
    async getCount(email) {
        return await this.model.countDocuments({ email });
    }
    async addHospital(patientId, hospitalId, session) {
        return await this.model.findByIdAndUpdate(patientId, { $addToSet: { hospital_id: hospitalId } }, { new: true, session });
    }
}
