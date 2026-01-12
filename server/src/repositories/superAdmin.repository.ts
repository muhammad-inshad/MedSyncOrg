import { AdminModel } from "../model/admin.model.ts";
import { SuperAdminModel } from "../model/superAdmin.model.ts";

export class SuperAdminRepository{
    async findByEmail(email:string){
        return SuperAdminModel.findOne({email}).select("+password")
    }

    async getAllHospital(){
        return AdminModel.find()
    }
}