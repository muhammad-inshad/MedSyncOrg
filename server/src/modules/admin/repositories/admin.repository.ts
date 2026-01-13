import { AdminModel } from "../../../model/admin.model.ts";
import type { IAdmin } from "../../../model/admin.model.ts";

export class AdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    return AdminModel.findOne({ email }).select("+password");
  }

  async createAdmin(data: Partial<IAdmin>): Promise<IAdmin> {
    const admin = new AdminModel(data);
    return await admin.save();
  }
}
