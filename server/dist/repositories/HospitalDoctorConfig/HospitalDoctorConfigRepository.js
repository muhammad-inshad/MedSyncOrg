import { HospitalDoctorConfigModel } from "../../models/HospitalDoctorConfigModel.js";
import { BaseRepository } from "../IBase/BaseRepository.js";
export class HospitalDoctorConfigRepository extends BaseRepository {
    constructor() {
        super(HospitalDoctorConfigModel);
    }
    async findByDoctorIdHOspitalid(id) {
        return await this.model.findOne({ doctorId: id });
    }
}
