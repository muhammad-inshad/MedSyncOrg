import { IHospital } from "../../models/hospital.model.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export interface IHospitalRepository extends IBaseRepository<IHospital>{
    startSession(hospitalId: string): Promise<Date>;
};
