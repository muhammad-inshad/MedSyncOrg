
import { ClientSession } from "mongoose";
import { IPatient } from "../../models/Patient.model.js";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.js";

export interface IUserRepository extends IBaseRepository<IPatient>{
    getCount(email:string):Promise<number>
    addHospital(patientId: string, hospitalId: string,session?: ClientSession ): Promise<IPatient | null>;
};