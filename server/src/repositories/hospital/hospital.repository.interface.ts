import { IHospital } from "../../models/hospital.model.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export type IHospitalRepository = IBaseRepository<IHospital>;
