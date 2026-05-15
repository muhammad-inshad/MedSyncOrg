import { BaseRepository } from "../IBase/BaseRepository.js";
import { IHospital } from "../../models/hospital.model.js";
import { IHospitalRepository } from "./hospital.repository.interface.js";

export class HospitalRepository extends BaseRepository<IHospital> implements IHospitalRepository {
    async startSession(hospitalId: string): Promise<Date> {
        const session = await this.model.findOne({ _id: hospitalId },{projection:{_id:0,createAt:1}}).exec();
        return session?session.createdAt:new Date();
    }
}
