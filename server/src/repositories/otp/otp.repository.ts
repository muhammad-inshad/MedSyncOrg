import { BaseRepository } from "../BaseRepository.ts";
import { IOtp } from "../../models/Otp.model.ts";
import { OtpModel } from "../../models/Otp.model.ts";
import { IOtpRepository } from "./otp.repository.interface.ts";

export class OtpRepository extends BaseRepository<IOtp> implements IOtpRepository {
  constructor() {
    super(OtpModel);
  }

  async saveOtp(email: string, otp: string): Promise<void> {
    await this.model.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    ).exec();
  }

  async getOtpByEmail(email: string): Promise<IOtp | null> {
    return await this.model.findOne({ email }).exec();
  }

  async deleteOtpByEmail(email: string): Promise<void> {
    await this.model.deleteOne({ email }).exec();
  }
}