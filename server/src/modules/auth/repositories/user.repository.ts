import type { Model } from "mongoose";
import type { SignupDTO } from "../../../dto/auth/signup.dto";
import type { IPatient } from "../../../model/Patient.model"; 

export class UserRepository {
  constructor(private readonly userModel: Model<any>) {}

  async findByEmail(email: string): Promise<any | null> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<any | null> {
    return this.userModel.findById(id);
  }

  async createUser(data: SignupDTO & { password: string }): Promise<any> {
    return this.userModel.create(data);
  }

  async updatePassword(email: string, passwordHash: string): Promise<void> {
    await this.userModel.updateOne(
      { email }, 
      { $set: { password: passwordHash } }
    );
  }
}