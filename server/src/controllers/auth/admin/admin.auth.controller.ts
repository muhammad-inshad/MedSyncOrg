import { Request, Response } from "express";
import { IAdminAuthService } from "../../../services/auth/admin/admin.auth.service.interface.ts";
import { HttpStatusCode } from "../../../constants/httpStatus.ts";
import { MESSAGES } from "../../../constants/messages.ts";
import { AppError } from "../../../types/error.types.ts";
import { IAdminAuthController } from "./admin.auth.controller.interface.ts";
import { AdminUploadFiles } from "../../../types/admin.type.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";

export class AdminAuthController implements IAdminAuthController {
    constructor(private readonly _adminAuthService: IAdminAuthService) { }

    signup = async (req: Request, res: Response): Promise<Response> => {
        try {
            const adminData = req.body;
            const files = req.files as unknown as AdminUploadFiles;
            const result = await this._adminAuthService.signup(adminData, files);

            return ApiResponse.created(res, MESSAGES.ADMIN.SIGNUP_SUCCESS || "Hospital account created successfully", result);
        } catch (error: unknown) {
            const err = error as AppError;
            return ApiResponse.error(
                res,
                err.message || MESSAGES.SERVER.ERROR,
                null,
                (err.status as HttpStatusCode) || HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    loginAdmin = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return ApiResponse.validationError(res, MESSAGES.VALIDATION.REQUIRED_FIELD);
            }

            const result = await this._adminAuthService.loginAdmin({ email, password, role: "admin" });

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

            return ApiResponse.success(res, MESSAGES.ADMIN.LOGIN_SUCCESS || MESSAGES.AUTH.LOGIN_SUCCESS, result);
        } catch (error: unknown) {
            const err = error as AppError;
            return ApiResponse.error(
                res,
                err.message || MESSAGES.SERVER.ERROR,
                null,
                (err.status as HttpStatusCode) || HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}

