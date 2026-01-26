import { Model } from "mongoose";
import type { IDoctor } from "../../../model/doctor.model";

export class DoctorRepository {
  constructor(private readonly model: Model<IDoctor>) {}

  async createDoctor(data: Partial<IDoctor>): Promise<IDoctor> {
    return await this.model.create(data);
  }

  async findByEmail(email: string): Promise<IDoctor | null> {
    return await this.model.findOne({ email }).select("+password").exec();
  }

  async findById(id: string): Promise<IDoctor | null> {
    return await this.model.findById(id).exec();
  }
  async update(id: string, data: any) {
    return await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async updatePassword(email: string, hashedPassword: string): Promise<IDoctor | null> {
    return await this.model.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { $set: { password: hashedPassword } },
      { new: true }
    ).exec();
  }
}