import { BaseRepository } from "../IBase/BaseRepository.js";
import { IPatient } from "../../models/Patient.model.js";
import { IUserRepository } from "./user.repository.interface.js";
import { ClientSession, Model } from "mongoose";

export class UserRepository extends BaseRepository<IPatient> implements IUserRepository {
     constructor(model:Model<IPatient>){
        super(model)
     }
     async getCount(email:string){
         return await this.model.countDocuments({email})
     }

     async addHospital(patientId: string, hospitalId: string, session?: ClientSession): Promise<IPatient | null> {
         return await this.model.findByIdAndUpdate(
             patientId,
             { $addToSet: { hospital_id: hospitalId } },
             { new: true, session }
         );
     }

}
