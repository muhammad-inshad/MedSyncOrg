
import { IPatient } from "../../models/Patient.model.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export type IUserRepository = IBaseRepository<IPatient>;