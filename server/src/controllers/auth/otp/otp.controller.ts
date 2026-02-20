import { NextFunction, Request, Response } from "express";
import { IPatientOtpAuthController } from "./otp.auth.controller.interface.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { IPatientOtpAuthService } from "../../../services/auth/otp/interfaces/otp.auth.service.interface.ts";
import { MESSAGES } from "../../../constants/messages.ts";

export default class OtpController implements IPatientOtpAuthController {
  constructor(private readonly otpService: IPatientOtpAuthService) { }

  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, purpose, role } = req.body;

      if (!email) {
        throw new Error(MESSAGES.VALIDATION.REQUIRED_FIELD);
      }

      await this.otpService.sendOtp(email, purpose, role);
      return ApiResponse.success(res, MESSAGES.AUTH.OTP_SENT);
    } catch (error: unknown) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { signupData, otp } = req.body;
      if (!signupData || !signupData.email) {
        return ApiResponse.validationError(res, "Missing signup data or email");
      }

      await this.otpService.verifyOtp(signupData.email, otp);

      return ApiResponse.success(res, MESSAGES.AUTH.OTP_VERIFIED);
    } catch (error: unknown) {
      next(error);
    }
  }
}