import { IHospitalDoctorConfig } from "../../models/HospitalDoctorConfigModel.js";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.js";

export interface IHospitalDoctorConfigRepository extends IBaseRepository<IHospitalDoctorConfig> {
   findByDoctorIdHOspitalid(id: string): Promise<IHospitalDoctorConfig | null>;
}