
import { IPatient } from "../../models/Patient.model.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export interface IUserRepository extends IBaseRepository<IPatient>{
    getCount(email:string):Promise<number>
    addHospital(patientId: string, hospitalId: string): Promise<IPatient | null>;
};