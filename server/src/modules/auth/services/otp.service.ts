import { generateOtp } from "../../../utils/otp/otp.util";
import { OtpData } from "../../../utils/otp/otp.Store";
import { EmailService } from "./email.service";

export class OtpService {
  constructor(
    private readonly store: Map<string, OtpData>,
    private readonly emailService: EmailService 
  ) {}

  async sendOtp(email: string) {
    const otp = generateOtp();
    const cleanEmail = email.trim().toLowerCase();
    this.store.set(cleanEmail, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    return await this.emailService.sendOtpEmail(cleanEmail, otp);
  }
  verifyOtp(email: string, userOtp: string): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase(); 

    const stored = this.store.get(cleanEmail);

    if (!stored) {
      return { success: false, message: "No OTP found for this email" };
    }

    if (stored.expiresAt < Date.now()) {
      this.store.delete(cleanEmail);
      return { success: false, message: "OTP has expired" };
    }

    if (stored.otp !== userOtp) {
      return { success: false, message: "Invalid OTP" };
    }

    this.store.delete(cleanEmail);
    return { success: true, message: "Verified" };
  }
}
