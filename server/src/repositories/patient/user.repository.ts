import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IPatient } from "../../models/Patient.model.ts";
import { IUserRepository } from "./user.repository.interface.ts";
import { Model } from "mongoose";

export class UserRepository extends BaseRepository<IPatient> implements IUserRepository {
     constructor(model:Model<IPatient>){
        super(model)
     }
     async getCount(email:string){
         return await this.model.countDocuments({email})
     }

     async addHospital(patientId: string, hospitalId: string): Promise<IPatient | null> {
         return await this.model.findByIdAndUpdate(
             patientId,
             { $addToSet: { hospital_id: hospitalId } },
             { new: true }
         );
     }
}
