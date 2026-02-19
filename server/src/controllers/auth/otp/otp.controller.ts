import type { Request, Response } from "express";
import { IPatientOtpAuthController } from "./otp.auth.controller.interface.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { IPatientOtpAuthService } from "../../../services/auth/otp/interfaces/otp.auth.service.interface.ts";
import { AppError } from "../../../types/error.types.ts";
import { HttpStatusCode } from "../../../constants/httpStatus.ts";
import { MESSAGES } from "../../../constants/messages.ts";

export default class OtpController implements IPatientOtpAuthController {
  constructor(private readonly otpService: IPatientOtpAuthService) { }

  async sendOtp(req: Request, res: Response) {
    try {
      const { email, purpose, role } = req.body;

      if (!email) {
        return ApiResponse.validationError(res, "Email required");
      }

      await this.otpService.sendOtp(email, purpose, role);
      return ApiResponse.success(res, MESSAGES.AUTH.OTP_SENT);
    } catch (error: unknown) {
      const err = error as AppError;
      return ApiResponse.error(
        res,
        err.message || "Failed to send OTP",
        null,
        (err.status as HttpStatusCode) || HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { signupData, otp } = req.body;
      if (!signupData || !signupData.email) {
        return ApiResponse.validationError(res, "Missing signup data or email");
      }

      await this.otpService.verifyOtp(signupData.email, otp);

      return ApiResponse.success(res, MESSAGES.AUTH.OTP_VERIFIED);
    } catch (error: unknown) {
      const err = error as AppError;
      return ApiResponse.error(
        res,
        err.message || "Failed to verify OTP",
        null,
        (err.status as HttpStatusCode) || HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}