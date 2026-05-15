import { HospitalDoctorConfigModel,IHospitalDoctorConfig } from "../../models/HospitalDoctorConfigModel.js";
import { BaseRepository } from "../IBase/BaseRepository.js";
import { IHospitalDoctorConfigRepository } from "./HospitalDoctorConfigRepository.interface.js";


export class HospitalDoctorConfigRepository extends BaseRepository<IHospitalDoctorConfig> implements IHospitalDoctorConfigRepository {
    constructor() {
      super(HospitalDoctorConfigModel);
    }   

    async findByDoctorIdHOspitalid(id: string) {
  return await this.model.findOne({ doctorId: id });
}
}