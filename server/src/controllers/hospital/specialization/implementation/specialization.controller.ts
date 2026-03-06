import { Request, Response, NextFunction } from "express";
import { ISpecializationService } from "../../../../services/hospital/specialization/interfaces/specialization.service.interface.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";

export class SpecializationManagementController {
    constructor(private readonly _specializationService: ISpecializationService) { }

    async getSpecializations(req: Request, res: Response, next: NextFunction) {
        try {
            const hospitalId = (req.user as any).userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            const result = await this._specializationService.getSpecializations(hospitalId, { page, limit, search });
            return ApiResponse.success(res, "Specializations fetched successfully", result, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async createSpecialization(req: Request, res: Response, next: NextFunction) {
        try {
            const hospitalId = (req.user as any).userId;
            const specializationData = req.body;
            const file = req.file;

            const specialization = await this._specializationService.createSpecialization(hospitalId, specializationData, file);
            return ApiResponse.success(res, "Specialization created successfully", specialization, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async updateSpecialization(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const specializationData = req.body;
            const file = req.file;

            const specialization = await this._specializationService.updateSpecialization(id, specializationData, file);
            if (!specialization) {
                return ApiResponse.error(res, "Specialization not found", HttpStatusCode.NOT_FOUND);
            }

            return ApiResponse.success(res, "Specialization updated successfully", specialization, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async toggleStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const specialization = await this._specializationService.toggleStatus(id);
            if (!specialization) {
                return ApiResponse.error(res, "Specialization not found", HttpStatusCode.NOT_FOUND);
            }
            return ApiResponse.success(res, "Specialization status toggled", specialization, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
}
