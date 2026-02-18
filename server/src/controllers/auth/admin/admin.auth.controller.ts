import { Request, Response } from "express";
import { HttpStatusCode } from "../../../constants/httpStatus.ts";
import { MESSAGES } from "../../../constants/messages.ts";
import { IAdminAuthService } from "../../../services/auth/admin/admin.auth.service.interface.ts";
import Logger from "../../../utils/logger.ts";
import { AdminUploadFiles } from "../../../types/admin.type.ts";
import { AppError } from "../../../types/error.types.ts";
import { IAdminAuthController } from "./admin.auth.controller.interface.ts";

export class AdminAuthController implements IAdminAuthController {
    constructor(private readonly _adminAuthService: IAdminAuthService) { }

    signup = async (req: Request, res: Response): Promise<Response> => {
        try {
            const adminData = req.body;
            const files = req.files as unknown as AdminUploadFiles;

            const result = await this._adminAuthService.signup(adminData, files);

            return res.status(HttpStatusCode.CREATED).json(result);
        } catch (error) {
            const err = error as AppError;
            Logger.error(`Admin Signup Error: ${err.message}`);

            return res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: err.message || MESSAGES.SERVER.ERROR,
            });
        }
    }

    loginAdmin = async (req: Request, res: Response): Promise<Response> => {
        try {
            const data = req.body;
            const result = await this._adminAuthService.loginAdmin(data);

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
                message: MESSAGES.ADMIN.LOGIN_SUCCESS,
                data: {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    user: { ...result.user, role: "admin" }
                }
            });
        } catch (error) {
            const err = error as AppError;
            Logger.error(`Admin Login Error: ${err.message}`);

            return res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                message: err.message || MESSAGES.SERVER.ERROR,
            });
        }
    }
}