import type { Request, Response } from "express";
import { generateOtp } from "../utils/otp/otp.util.ts";
import { otpStore } from "../utils/otp/otp.Store.ts";
import { transporter } from "../utils/otp/mail.util.ts";
import { OtpService } from "../services/otp.service.ts";

export default class OtpController {
  constructor(private readonly otpService: OtpService) { }

  async sendOtp(req: Request, res: Response) {
    try {
      const { email, froget, role } = req.body;
      console.log(email)
      if (!email) return res.status(400).json({ message: "Email required" });
      await this.otpService.sendOtp(email, froget, role);
      return res.status(200).json({ success: true, message: "OTP sent" });
    } catch (error: any) {
      const status = error.status || 500;
      const message = error.message || "Failed to send OTP";

      return res.status(status).json({
        success: false,
        message: message
      });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    const { signupData, otp } = req.body;
    const result = this.otpService.verifyOtp(signupData.email, otp);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, message: "Verified" });
  }
}