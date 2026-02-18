import { Request, Response } from "express";
import { HttpStatusCode } from "../../../constants/httpStatus.ts";
import { IDoctorAuthService } from "../../../services/auth/doctor/doctor.auth.service.interface.ts";
import { DoctorUploadFiles } from "../../../types/doctor.types.ts";
import { DoctorSignupDTO, LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { MESSAGES } from "../../../constants/messages.ts";
import { IDoctorAuthController } from "./doctor.auth.controller.interface.ts";
import { AppError } from "../../../types/error.types.ts";

export class DoctorAuthController implements IDoctorAuthController {
  constructor(private readonly _doctorAuthService: IDoctorAuthService) { }

  registerDoctor = async (req: Request, res: Response) => {
    try {
      const files = req.files as unknown as DoctorUploadFiles;
      const doctorData = req.body as DoctorSignupDTO;

      const doctor = await this._doctorAuthService.registerDoctor(
        doctorData,
        files
      );

      return res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: MESSAGES.DOCTOR.REGISTER_SUCCESS,
        data: doctor,
      });
    } catch (error: unknown) {
      const err = error as AppError;
      const errorMessage = err.message || MESSAGES.DOCTOR.REGISTER_FAILED;
      const errorStatus = err.status || HttpStatusCode.INTERNAL_SERVER_ERROR;

      return res.status(errorStatus).json({
        success: false,
        message: errorMessage,
      });
    }
  };

  loginDoctor = async (req: Request, res: Response) => {
    try {
      const loginData = req.body as LoginDTO;
      const result = await this._doctorAuthService.loginDoctor(loginData);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
        path: "/",
      });
      return res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Doctor login successful",
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            ...result.user,
            role: "doctor"
          }
        }
      });
    } catch (error: unknown) {
      const err = error as AppError;
      const errorMessage = err.message || MESSAGES.AUTH.LOGIN_FAILED;
      const errorStatus = err.status || HttpStatusCode.INTERNAL_SERVER_ERROR;

      return res.status(errorStatus).json({
        success: false,
        message: errorMessage,
      });
    }
  };
}