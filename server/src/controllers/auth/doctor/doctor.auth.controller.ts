import { NextFunction, Request, Response } from "express";

import { IDoctorAuthService } from "../../../services/auth/doctor/doctor.auth.service.interface.ts";
import { DoctorUploadFiles } from "../../../types/doctor.types.ts";
import { DoctorSignupDTO, LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { MESSAGES } from "../../../constants/messages.ts";
import { IDoctorAuthController } from "./doctor.auth.controller.interface.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";

export class DoctorAuthController implements IDoctorAuthController {
  constructor(private readonly _doctorAuthService: IDoctorAuthService) { }

  registerDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as unknown as DoctorUploadFiles;
      const doctorData = req.body as DoctorSignupDTO;

      const doctor = await this._doctorAuthService.registerDoctor(
        doctorData,
        files
      );

      return ApiResponse.created(res, MESSAGES.DOCTOR.REGISTER_SUCCESS, doctor);
    } catch (error: unknown) {
      next(error);
    }
  };

  loginDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData = req.body as LoginDTO;
      const result = await this._doctorAuthService.loginDoctor(loginData);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1000,
        path: "/",
      });

      return ApiResponse.success(res, MESSAGES.DOCTOR.LOGIN_SUCCESS, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: {
          ...result.user,
          role: "doctor"
        }
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  selectHospitals=async(req:Request,res:Response,next:NextFunction)=>{
    try {
     
      const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 6;
        const search = (req.query.search as string) || "";
        const result = await this._doctorAuthService.getAvailableHospitals(page, limit, search);
        return ApiResponse.success(res, "Hospitals fetched successfully", result);
    } catch (error: unknown) {
        next(error);
    }
  }
}
