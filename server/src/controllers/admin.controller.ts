import type { Request, Response } from "express";
import { IAdminService } from "../interfaces/IAdminService.ts";
import { HttpStatusCode } from "../constants/httpStatus.ts";
import { MESSAGES } from "../constants/messages.ts";
import Logger from "../utils/logger.ts";

export class AdminController {
    private adminService: IAdminService;

    constructor(adminService: IAdminService) {
        this.adminService = adminService;
    }


    async getme(req: Request, res: Response) {
        try {
            const adminID = (req as any).user.userId;
            const Admin = await this.adminService.getAdminProfile(adminID);
            return res.status(HttpStatusCode.OK).json({
                success: true,
                data: Admin,
            });
        } catch (error: any) {
            Logger.error(`Admin GetMe Error: ${error.message}`);
            return res.status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || MESSAGES.ADMIN.FETCH_SUCCESS, // Check message logic here, usually FETCH_SUCCESS is for success
            });
        }
    };

    getAllHospitals = async (req: Request, res: Response) => {
        try {
            const hospitals = await this.adminService.getAllHospitals();
            return res.status(HttpStatusCode.OK).json({
                success: true,
                data: hospitals,
            });
        } catch (error: any) {
            Logger.error(`Get All Hospitals Error: ${error.message}`);
            return res.status(error.status || HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || "Failed to fetch hospitals",
            });
        }
    };
}

