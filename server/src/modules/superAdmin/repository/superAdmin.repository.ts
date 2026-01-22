import { Model } from "mongoose"; 
import { AdminModel,IAdmin} from "../../../model/admin.model.ts";
import { ISuperAdmin, SuperAdminModel } from "../../../model/superAdmin.model.ts";

export class SuperAdminRepository {
    constructor(private readonly model: Model<ISuperAdmin>) {}

    async findByEmail(email: string) {
        return await this.model.findOne({ email }).select("+password").exec();
    }

    async getAllHospital() {
        return await AdminModel.find().exec();
    }

    async findById(id:string){
       let superAdmin= await SuperAdminModel.findById(id)
       if(!superAdmin){
         throw new Error("User not found");
       }
       return superAdmin
    }

async updateById(id: string, isActive: boolean) {
    return await AdminModel.findByIdAndUpdate(
    id,
    { isActive },  
    { new: true }  
  );
}

}