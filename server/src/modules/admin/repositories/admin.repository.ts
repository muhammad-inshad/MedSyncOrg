import { Model } from "mongoose";
import type { IAdmin } from "../../../model/admin.model";
import { IDoctor, DoctorModel } from "../../../model/doctor.model";

export class AdminRepository {
  constructor(private readonly model: Model<IAdmin>, private readonly doctorModel: Model<IDoctor> = DoctorModel) { }

  async findByEmail(email: string): Promise<IAdmin | null> {
    return await this.model.findOne({ email }).select("+password");
  }

  async createAdmin(data: Partial<IAdmin>): Promise<IAdmin> {
    const admin = new this.model(data);
    return await admin.save();
  }

  async findById(id: string): Promise<IAdmin | null> {
    return await this.model.findById(id).exec();
  }

  async update(id: string, data: Partial<IAdmin>): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  async findAllDoctors() {
    return await this.doctorModel.find().sort({ createdAt: -1 }).lean().exec();
  }
  async updateDoctorStatus(id: string, status: boolean): Promise<IDoctor | null> {
    return await this.doctorModel.findByIdAndUpdate(
      id,
      { $set: { isActive: status } },
      { new: true }
    ).exec();
  }
}
