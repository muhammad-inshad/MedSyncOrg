import { NextFunction, Request, Response } from "express";
import { ISuperAdminAuthService } from "../../../services/auth/superAdmin/superAdmin.auth.service.interface.ts";
import { MESSAGES } from "../../../constants/messages.ts";
import { ISuperAdminAuthController } from "./superAdmin.auth.controller.interface.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";


export class SuperAdminAuthController implements ISuperAdminAuthController {
    constructor(private readonly _SuperadminAuthService: ISuperAdminAuthService) { }
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new Error(MESSAGES.VALIDATION.REQUIRED_FIELD);
            }

            const result = await this._SuperadminAuthService.login(email, password);

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
