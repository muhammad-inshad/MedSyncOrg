import { Request, Response } from "express";
import { SuperadminkycService } from "../services/superAdminkyc.service.ts";

export class Superadminkyc {
    constructor(private readonly service: SuperadminkycService) { }

    hospitals = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 8;
            const search = req.query.search as string;
            const filterStr = req.query.filter as string;
            let filter = {};

            if (filterStr && filterStr !== 'all') {
                filter = { reviewStatus: filterStr };
            } else {
                filter = { reviewStatus: { $in: ['pending', 'revision', 'rejected'] } };
            }
            const result = await this.service.hospitals({ page, limit, search, filter });

            return res.status(200).json({
                success: true,
                data: result.data,
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    hospitalStatus = async (req: Request, res: Response) => {
        try {
            const { id, status } = req.params;
            const { rejectionReason } = req.body;
            const result = await this.service.updateHospitalStatus(id, status, rejectionReason);
            return res.status(200).json({
                success: true,
                message: "Status updated successfully",
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    reapply = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await this.service.updateHospitalStatusReapply(id);
            return res.status(200).json({
                success: true,
                message: "Status updated successfully",
                data: result
            });
        } catch (error: unknown) {

            const message = error instanceof Error ? error.message : "An unexpected error occurred";

            return res.status(500).json({
                success: false,
                message: message
            });
        }
    }
}