import { IHospital } from "../../models/hospital.model.js";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.js";

export interface IHospitalRepository extends IBaseRepository<IHospital>{
    startSession(hospitalId: string): Promise<Date>;
};
