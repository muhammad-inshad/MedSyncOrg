import type { Request, Response } from "express";
import { generateOtp } from "../utils/otp/otp.util.ts";
import { otpStore } from "../utils/otp/otp.Store.ts";
import { transporter } from "../utils/otp/mail.util.ts";




class OtpController {
  
   async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const otp = generateOtp();
console.log(otp)

      otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      await transporter.sendMail({
        from: `"MedSync" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Your OTP Code - MedSync",
        text: `Your OTP is ${otp}. It is valid for 5 minutes only.`,
        html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes only.</p>`,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }
  }

  verifyOtp(req: Request, res: Response) {
    try {
      const { signupData, otp } = req.body;

      if (!signupData?.email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
      }

      const email = signupData.email;
      const stored = otpStore.get(email);

      if (!stored) {
        return res.status(400).json({
          success: false,
          message: "No OTP found for this email. Please request a new one.",
        });
      }

      if (stored.expiresAt < Date.now()) {
        otpStore.delete(email);
        return res.status(400).json({
          success: false,
          message: "OTP has expired",
        });
      }
      if (stored.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

  
      otpStore.delete(email);

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

}

export default OtpController;