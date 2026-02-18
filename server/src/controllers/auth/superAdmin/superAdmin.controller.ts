import { Request, Response } from "express";
import { ISuperAdminAuthService } from "../../../services/auth/superAdmin/superAdmin.auth.service.interface.ts";
import { HttpStatusCode } from "../../../constants/httpStatus.ts";
import { MESSAGES } from "../../../constants/messages.ts";


export class SuperAdminAuthController {
    constructor(private readonly _SuperadminAuthService: ISuperAdminAuthService) { }
    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: MESSAGES.VALIDATION.REQUIRED_FIELD
                });
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

            return res.status(HttpStatusCode.OK).json({
                success: true,
                message: MESSAGES.AUTH.LOGIN_SUCCESS,
                data: {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    user: result.user
                }
            });
        } catch (error: any) {
            return res.status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || MESSAGES.SERVER.ERROR
            });
        }
    }
}