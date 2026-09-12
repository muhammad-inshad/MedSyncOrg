import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IPatient } from "../../models/Patient.model.ts";
import { IUserRepository } from "./user.repository.interface.ts";
import { ClientSession, FilterQuery, Model } from "mongoose";

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

     async findByEmail(email: string): Promise<IPatient | null> {
         return await this.model.findOne({ email } as FilterQuery<IPatient>).exec();
     }

     async findByIdWithPassword(id: string): Promise<IPatient | null> {
         return await this.model.findById(id).select('+password').exec();
     }

}
