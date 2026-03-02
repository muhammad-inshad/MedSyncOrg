import { NextFunction, Request, Response } from "express";
import { ISuperAdminHospitalController } from "../interfaces/hospital.controller.interface.ts";
import { ISuperAdminHospitalService } from "../../../../services/superAdmin/hospital/interfaces/hospital.service.interface.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../../constants/httpStatus.ts";
import { IHospital } from "../../../../models/hospital.model.ts";

export class SuperAdminHospitalController implements ISuperAdminHospitalController {
    constructor(private readonly service: ISuperAdminHospitalService) { }

    hospitalManagement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 8;
            const search = req.query.search as string;
            const status = req.query.status as string;

            let isActive: boolean | undefined;
            if (status === "Active") isActive = true;
            else if (status === "Inactive") isActive = false;

            const result = await this.service.hospitalManagement({ page, limit, search, isActive });

            ApiResponse.success(res, "Hospital management data fetched successfully", result.data, HttpStatusCode.OK, {
                page,
                limit,
                totalItems: result.total,
                totalPages: Math.ceil(result.total / limit)
            });
        } catch (error: unknown) {
            next(error);
        }
    };

    setActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id, isActive } = req.body;

            if (!id || isActive === undefined) {
                ApiResponse.validationError(res, "Missing required parameters: id and isActive");
                return;
            }
            const result = await this.service.setActive(id as string, isActive);

            ApiResponse.success(res, "Hospital status updated successfully", result);
        } catch (error: unknown) {
            next(error);
        }
    };

    hospitalStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id, status } = req.params;
            const { rejectionReason } = req.body;
            const result = await this.service.updateHospitalStatus(id, status, rejectionReason);
            ApiResponse.success(res, "Hospital status updated successfully", result);
        } catch (error: unknown) {
            next(error);
        }
    };

    addHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const hospitalData = req.body as Partial<IHospital>;
            const files = req.files as {
                logo?: Express.Multer.File[];
                licence?: Express.Multer.File[];
            };
            const result = await this.service.addHospital(hospitalData, {
                logo: files?.logo?.[0],
                licence: files?.licence?.[0]
            });
            ApiResponse.success(res, "Hospital created successfully", result, HttpStatusCode.CREATED);
        } catch (error: unknown) {
            next(error);
        }
    };

    editHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body as Partial<IHospital>;
            const files = req.files as {
                logo?: Express.Multer.File[];
                licence?: Express.Multer.File[];
            };

            if (updateData && updateData.subscription && typeof updateData.subscription === 'string') {
                try {
                    updateData.subscription = JSON.parse(updateData.subscription);
                } catch (e) {
                    console.error("Failed to parse subscription", e);
                }
            }

            const result = await this.service.editHospital(id, updateData, {
                logo: files?.logo?.[0],
                licence: files?.licence?.[0]
            });
            ApiResponse.success(res, "Hospital updated successfully", result);
        } catch (error: unknown) {
            next(error);
        }
    };


}
