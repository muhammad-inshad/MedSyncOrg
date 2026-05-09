import { IHospitalDoctorConfig } from "../../models/HospitalDoctorConfigModel.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export interface IHospitalDoctorConfigRepository extends IBaseRepository<IHospitalDoctorConfig> {
   findByDoctorIdHOspitalid(id: string): Promise<IHospitalDoctorConfig | null>;
}