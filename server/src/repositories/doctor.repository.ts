import { DoctorModel } from "../model/doctor.model.ts";
import type { IDoctor } from "../model/doctor.model.ts";

export class DoctorRepository {
  async createDoctor(data: Partial<IDoctor>) {
    return DoctorModel.create(data);
  }

  async findByEmail(email: string) {
    return DoctorModel.findOne({ email }).select("+password");
  }
}
