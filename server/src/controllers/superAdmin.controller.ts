import { NextFunction, Request, Response } from "express";
import { SuperAdminService } from "../services/superAdmin.service.ts";
import { ApiResponse } from "../utils/apiResponse.utils.ts";

export class SuperAdminController {
    constructor(private readonly service: SuperAdminService) { }



    hospitalManagement = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 8;
            const search = req.query.search as string;

            const result = await this.service.hospitalManagement({ page, limit, search });

            return ApiResponse.success(res, "Hospital management data fetched successfully", result.data, 200, {
                page,
                limit,
                totalItems: result.total,
                totalPages: Math.ceil(result.total / limit)
            });
        } catch (error: any) {
            next(error);
        }
    };

    getme = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const superAdminId = (req as any).user.userId;
            const superAdmin = await this.service.getme(superAdminId);

            return ApiResponse.success(res, "Super admin details fetched successfully", superAdmin);
        } catch (error: any) {
            next(error);
        }
    };

    setActive = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, isActive } = req.body;

            if (!id || isActive === undefined) {
                return ApiResponse.validationError(res, "Missing required parameters: id and isActive");
            }
            const result = await this.service.setActive(id as string, isActive);

            return ApiResponse.success(res, "Hospital status updated successfully", result);
        } catch (error: any) {
            next(error);
        }
    };

    getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await this.service.getDashboardStats();
            return ApiResponse.success(res, "Dashboard stats fetched successfully", stats);
        } catch (error: any) {
            next(error);
        }
    };
}
