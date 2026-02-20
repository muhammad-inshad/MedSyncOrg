import { NextFunction, Request, Response } from "express";
import { IAdminService } from "../interfaces/IAdminService.ts";
import { MESSAGES } from "../constants/messages.ts";
import Logger from "../utils/logger.ts";
import { ApiResponse } from "../utils/apiResponse.utils.ts";

export class AdminController {
    private adminService: IAdminService;

    constructor(adminService: IAdminService) {
        this.adminService = adminService;
    }

    getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const adminID = (req as any).user.userId;
            const stats = await (this.adminService as any).getDashboardStats(adminID);
            return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, stats);
        } catch (error: unknown) {
            next(error);
        }
    };


    async getme(req: Request, res: Response, next: NextFunction) {
        try {
            const adminID = (req as any).user.userId;
            const Admin = await this.adminService.getAdminProfile(adminID);
            return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, Admin);
        } catch (error: unknown) {
            next(error);
        }
    };

    getAllHospitals = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const hospitals = await this.adminService.getAllHospitals();
            return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, hospitals);
        } catch (error: unknown) {
            next(error);
        }
    };
}
