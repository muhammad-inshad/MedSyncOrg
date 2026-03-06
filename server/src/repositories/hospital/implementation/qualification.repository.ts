import { Model } from "mongoose";
import { IQualification } from "../../../models/qualification.model.ts";
import { BaseRepository } from "../../IBase/BaseRepository.ts";
import { IQualificationRepository } from "../qualification.repository.interface.ts";

export class QualificationRepository extends BaseRepository<IQualification> implements IQualificationRepository {
    constructor(model: Model<IQualification>) {
        super(model);
    }

    async findByHospitalId(hospitalId: string): Promise<IQualification[]> {
        return await this.model.find({ hospital_id: hospitalId }).sort({ createdAt: -1 }).exec();
    }
}
