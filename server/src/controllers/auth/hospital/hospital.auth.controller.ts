import { NextFunction, Request, Response } from "express";
import { IHospitalAuthService } from "../../../services/auth/hospital/hospital.auth.service.interface.ts";
import { HttpStatusCode } from "../../../constants/enums.ts";
import { MESSAGES } from "../../../constants/messages.ts";
import { IHospitalAuthController } from "./hospital.auth.controller.interface.ts";
import { HospitalUploadFiles } from "../../../types/hospital.type.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";


export class HospitalAuthController implements IHospitalAuthController {
    constructor(private readonly _hospitalAuthService: IHospitalAuthService) { }

    signup = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const hospitalData = req.body;
            const files = req.files as unknown as HospitalUploadFiles;
            const result = await this._hospitalAuthService.signup(hospitalData, files);

            return ApiResponse.created(res, MESSAGES.ADMIN.SIGNUP_SUCCESS || "Hospital account created successfully", result);
        } catch (error: unknown) {
            next(error);
        }
    }

    loginHospital = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
            }

            const result = await this._hospitalAuthService.loginHospital({ email, password, role: "hospital" });

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

            return ApiResponse.success(res, MESSAGES.ADMIN.LOGIN_SUCCESS || MESSAGES.AUTH.LOGIN_SUCCESS, result);
        } catch (error: unknown) {
            next(error);
        }
    }
}
