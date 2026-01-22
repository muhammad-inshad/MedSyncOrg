import { Model } from "mongoose";
import type { IAdmin } from "../../../model/admin.model";
import { Mode } from "node:fs";

export class AdminRepository {
   constructor(private readonly model:Model<IAdmin>){}

  async findByEmail(email: string): Promise<IAdmin | null> {
    return await this.model.findOne({ email }).select("+password");
  }

  async createAdmin(data: Partial<IAdmin>): Promise<IAdmin> {
    const admin = new this.model(data);
    return await admin.save();
  }

  async findById(id:string): Promise<IAdmin | null> {
      return await this.model.findById(id).exec();
    }
}
