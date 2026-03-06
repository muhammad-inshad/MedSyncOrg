import { NextFunction, Request, Response } from "express";
import { IQualificationService } from "../../../../services/hospital/qualification/interfaces/qualification.service.interface.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";
import { IQualification } from "../../../../models/qualification.model.ts";

export class QualificationManagementController {
    constructor(private readonly _qualificationService: IQualificationService) { }

    async getQualifications(req: Request, res: Response, next: NextFunction) {
        try {
            const hospitalId = req.user?.userId;
            if (!hospitalId) {
                return ApiResponse.unauthorized(res, "Hospital ID not found in token");
            }

            const { page = 1, limit = 10, search = "" } = req.query;

            const paginatedQualifications = await this._qualificationService.getQualifications(
                hospitalId,
                Number(page),
                Number(limit),
                search as string
            );

            return ApiResponse.success(res, "Qualifications fetched successfully", paginatedQualifications, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async createQualification(req: Request, res: Response, next: NextFunction) {
        try {
            const hospitalId = req.user?.userId;
            if (!hospitalId) {
                return ApiResponse.unauthorized(res, "Hospital ID not found in token");
            }
            const qualificationData: Partial<IQualification> = req.body;
            const file = req.file;

            const qualification = await this._qualificationService.createQualification(hospitalId, qualificationData, file);
            return ApiResponse.success(res, "Qualification created successfully", qualification, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async updateQualification(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const qualificationData: Partial<IQualification> = req.body;
            const file = req.file;

            const qualification = await this._qualificationService.updateQualification(id, qualificationData, file);
            if (!qualification) {
                return ApiResponse.notFound(res, "Qualification not found");
            }
            return ApiResponse.success(res, "Qualification updated successfully", qualification, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async toggleStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const qualification = await this._qualificationService.toggleStatus(id);
            if (!qualification) {
                return ApiResponse.notFound(res, "Qualification not found");
            }
            return ApiResponse.success(res, "Status toggled successfully", qualification, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
}
