import type { Request, Response } from "express";
import { generateOtp } from "../../../utils/otp/otp.util.ts";
import { otpStore } from "../../../utils/otp/otp.Store.ts";
import { transporter } from "../../../utils/otp/mail.util.ts";
import { OtpService } from "../services/otp.service.ts";

export default class OtpController {
  constructor(private readonly otpService: OtpService) {} 

  async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email required" });

      await this.otpService.sendOtp(email);
      
      return res.status(200).json({ success: true, message: "OTP sent" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    const { signupData, otp } = req.body;
    const result = this.otpService.verifyOtp(signupData.email, otp);
console.log(result)
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, message: "Verified" });
  }
}