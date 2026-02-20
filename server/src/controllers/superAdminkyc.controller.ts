import { NextFunction, Request, Response } from "express";
import { SuperadminkycService } from "../services/superAdminkyc.service.ts";
import { ApiResponse } from "../utils/apiResponse.utils.ts";

export class Superadminkyc {
    constructor(private readonly service: SuperadminkycService) { }

    hospitals = async (req: Request, res: Response, next: NextFunction) => {
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

            return ApiResponse.success(res, "Hospitals fetched successfully", result.data, 200, {
                page,
                limit,
                totalItems: result.total,
                totalPages: Math.ceil(result.total / limit)
            });
        } catch (error: any) {
            next(error);
        }
    }

    hospitalStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, status } = req.params;
            const { rejectionReason } = req.body;
            const result = await this.service.updateHospitalStatus(id, status, rejectionReason);
            return ApiResponse.success(res, "Status updated successfully", result);
        } catch (error: any) {
            next(error);
        }
    }

    reapply = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.service.updateHospitalStatusReapply(id);
            return ApiResponse.success(res, "Status updated successfully", result);
        } catch (error: unknown) {
            next(error);
        }
    }
}