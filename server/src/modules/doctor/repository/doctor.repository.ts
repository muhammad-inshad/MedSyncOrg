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
}