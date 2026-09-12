import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IHospital } from "../../models/hospital.model.ts";
import { IHospitalRepository } from "./hospital.repository.interface.ts";
import { FilterQuery } from "mongoose";

export class HospitalRepository extends BaseRepository<IHospital> implements IHospitalRepository {
    async startSession(hospitalId: string): Promise<Date> {
        const session = await this.model.findOne({ _id: hospitalId },{projection:{_id:0,createAt:1}}).exec();
        return session?session.createdAt:new Date();
    }

    async findByEmail(email: string): Promise<IHospital | null> {
        return await this.model.findOne({ email } as FilterQuery<IHospital>).exec();
    }

    async findByEmailWithPassword(email: string): Promise<IHospital | null> {
        return await this.model.findOne({ email } as FilterQuery<IHospital>).select('+password').exec();
    }
}
