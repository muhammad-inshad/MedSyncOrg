import { NextFunction, Request, Response } from "express";
import { ISuperAdminDashboardController } from "../interfaces/dashboard.controller.interface.ts";
import { ISuperAdminDashboardService } from "../../../../services/superAdmin/dashboard/interfaces/dashboard.service.interface.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";
import { ITokenPayload } from "../../../../services/token/token.service.interface.ts";

export class SuperAdminDashboardController implements ISuperAdminDashboardController {
    constructor(private readonly service: ISuperAdminDashboardService) { }

    getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const stats = await this.service.getDashboardStats();
            ApiResponse.success(res, "Dashboard stats fetched successfully", stats);
        } catch (error: unknown) {
            next(error);
        }
    };

    getme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as unknown as ITokenPayload;
            const superAdminId = user?.userId;

            if (!superAdminId) {
                ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
                return;
            }

            const superAdmin = await this.service.getme(superAdminId);
            ApiResponse.success(res, "Super admin details fetched successfully", superAdmin);
        } catch (error: unknown) {
            next(error);
        }
    };
}
