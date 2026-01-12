import { Patient } from "../model/user.model.ts";
import type { SignupDTO } from "../dto/auth/signup.dto.ts";
import type { IPatient } from "../model/user.model.ts";

export class UserRepository {
  async findByEmail(email: string): Promise<IPatient | null> {
    return Patient.findOne({ email });
  }
  
 async findById(id:string):Promise<IPatient|null>{
  return Patient.findById(id)
 }

  async createUser(data: SignupDTO & { password: string }): Promise<IPatient> {
    return Patient.create(data);
  }
  
}
