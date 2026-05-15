import { Model } from "mongoose";
import { IQualification } from "../../../models/qualification.model.js";
import { BaseRepository } from "../../IBase/BaseRepository.js";
import { IQualificationRepository } from "../qualification.repository.interface.js";

export class QualificationRepository extends BaseRepository<IQualification> implements IQualificationRepository {
    constructor(model: Model<IQualification>) {
        super(model);
    }

    async findByHospitalId(hospitalId: string): Promise<IQualification[]> {
        return await this.model.find({ hospital_id: hospitalId , isActive: true,}).sort({ createdAt: -1 }).exec();
    }
}
