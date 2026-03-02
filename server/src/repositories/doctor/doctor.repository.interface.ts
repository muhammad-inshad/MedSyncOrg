import { IDoctor } from "../../models/doctor.model.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";


export type IDoctorRepository = IBaseRepository<IDoctor>;