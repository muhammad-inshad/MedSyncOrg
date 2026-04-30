import { HospitalDoctorConfigModel,IHospitalDoctorConfig } from "../../models/HospitalDoctorConfigModel.ts";
import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IHospitalDoctorConfigRepository } from "./HospitalDoctorConfigRepository.interface.ts";


export class HospitalDoctorConfigRepository extends BaseRepository<IHospitalDoctorConfig> implements IHospitalDoctorConfigRepository {
    constructor() {
      super(HospitalDoctorConfigModel);
    }   
}