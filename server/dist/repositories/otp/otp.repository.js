import { OtpModel } from "../../models/Otp.model.js";
import { BaseRepository } from "../IBase/BaseRepository.js";
export class OtpRepository extends BaseRepository {
    constructor() {
        super(OtpModel);
    }
    async saveOtp(email, otp) {
        await this.model.findOneAndUpdate({ email }, { otp, createdAt: new Date() }, { upsert: true, new: true }).exec();
    }
    async getOtpByEmail(email) {
        return await this.model.findOne({ email }).exec();
    }
    async deleteOtpByEmail(email) {
        await this.model.deleteOne({ email }).exec();
    }
}
