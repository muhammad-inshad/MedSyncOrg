import { NextFunction, Request, Response } from "express";
import { ISuperAdminKycController } from "../interfaces/kyc.controller.interface.ts";
import { ISuperAdminKycService } from "../../../../services/superAdmin/kycManagement/interfaces/kyc.service.interface.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";



export class SuperAdminKycController implements ISuperAdminKycController {
    constructor(private readonly service: ISuperAdminKycService) { }

    hospitals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 8;
            const search = req.query.search as string;
            const filterStr = req.query.filter as string;
            let filter = {};
            if (filterStr && filterStr !== "all") {
                filter = { reviewStatus: filterStr };
            } else {
                filter = { reviewStatus: { $in: ["pending", "revision", "rejected"] } };
            }

            const result = await this.service.hospitals({ page, limit, search, filter });
            ApiResponse.success(res, "Hospitals fetched successfully", result.data, HttpStatusCode.OK, {
                page,
                limit,
                totalItems: result.total,
                totalPages: Math.ceil(result.total / limit)
            });
        } catch (error: unknown) {
            next(error);
        }
    };


}
