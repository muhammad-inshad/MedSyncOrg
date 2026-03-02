import { NextFunction, Request, Response } from "express";
import { ISuperAdminAuthService } from "../../../services/auth/superAdmin/superAdmin.auth.service.interface.ts";
import { HttpStatusCode } from "../../../constants/httpStatus.ts";
import { MESSAGES } from "../../../constants/messages.ts";
import { ISuperAdminAuthController } from "./superAdmin.auth.controller.interface.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";


export class SuperAdminAuthController implements ISuperAdminAuthController {
    constructor(private readonly _SuperadminAuthService: ISuperAdminAuthService) { }
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
console.log(email,password)
            if (!email || !password) {
                ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
            }

            const result = await this._SuperadminAuthService.login(email, password);

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

            return ApiResponse.success(res, MESSAGES.AUTH.LOGIN_SUCCESS, {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: result.user
            });
        } catch (error: unknown) {
            next(error);
        }
    }
}
