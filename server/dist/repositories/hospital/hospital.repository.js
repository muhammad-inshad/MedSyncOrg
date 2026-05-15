import { BaseRepository } from "../IBase/BaseRepository.js";
export class HospitalRepository extends BaseRepository {
    async startSession(hospitalId) {
        const session = await this.model.findOne({ _id: hospitalId }, { projection: { _id: 0, createAt: 1 } }).exec();
        return session ? session.createdAt : new Date();
    }
}
