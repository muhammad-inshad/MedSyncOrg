import type { Request, Response } from "express";
import { SuperAdminService } from "../services/superAdmin.service.ts";

export class SuperAdminController {
    constructor(private readonly service: SuperAdminService) { }

  

    hospitalManagement = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 8;
            const search = req.query.search as string;

            const result = await this.service.hospitalManagement({ page, limit, search });

            return res.status(200).json({
                success: true,
                data: result.data,
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            });
        } catch (error: any) {
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || "Failed to fetch hospital management data"
            });
        }
    };

    getme = async (req: Request, res: Response) => {
        try {
            const superAdminId = (req as any).user.userId;
            const superAdmin = await this.service.getme(superAdminId);

            return res.status(200).json({
                success: true,
                data: superAdmin
            });
        } catch (error: any) {
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || "Failed to fetch super admin details"
            });
        }
    };

    setActive = async (req: Request, res: Response) => {
        try {
            const { id, isActive } = req.body;

            if (!id || isActive === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required parameters: id and isActive"
                });
            }
            const result = await this.service.setActive(id as string, isActive);

            return res.status(200).json({
                success: true,
                message: "Hospital status updated successfully",
                data: result
            });
        } catch (error: any) {
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || "Failed to update hospital status"
            });
        }
    };
}
