import type { Request, Response } from "express";
import { IAdminService } from "../interfaces/IAdminService.ts";
import { HttpStatusCode } from "../constants/httpStatus.ts";
import { MESSAGES } from "../constants/messages.ts";
import Logger from "../utils/logger.ts";
import { ApiResponse } from "../utils/apiResponse.utils.ts";
import { AppError } from "../types/error.types.ts";

export class AdminController {
    private adminService: IAdminService;

    constructor(adminService: IAdminService) {
        this.adminService = adminService;
    }

    getDashboardStats = async (req: Request, res: Response) => {
        try {
            const adminID = (req as any).user.userId;
            const stats = await (this.adminService as any).getDashboardStats(adminID);
            return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, stats);
        } catch (error: unknown) {
            const err = error as AppError;
            Logger.error(`Get Dashboard Stats Error: ${err.message}`);
            return ApiResponse.error(
                res,
                err.message || "Failed to fetch dashboard stats",
                null,
                (err.status as HttpStatusCode) || HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    };


    async getme(req: Request, res: Response) {
        try {
            const adminID = (req as any).user.userId;
            const Admin = await this.adminService.getAdminProfile(adminID);
            return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, Admin);
        } catch (error: unknown) {
            const err = error as AppError;
            Logger.error(`Admin GetMe Error: ${err.message}`);
            return ApiResponse.error(
                res,
                err.message || MESSAGES.SERVER.ERROR,
                null,
                (err.status as HttpStatusCode) || HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    };

    getAllHospitals = async (req: Request, res: Response) => {
        try {
            const hospitals = await this.adminService.getAllHospitals();
            return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, hospitals);
        } catch (error: unknown) {
            const err = error as AppError;
            Logger.error(`Get All Hospitals Error: ${err.message}`);
            return ApiResponse.error(
                res,
                err.message || "Failed to fetch hospitals",
                null,
                (err.status as HttpStatusCode) || HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    };
}

