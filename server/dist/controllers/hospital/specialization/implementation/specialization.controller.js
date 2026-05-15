import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
import logger from "../../../../utils/logger.js";
export class SpecializationManagementController {
    constructor(_specializationService) {
        this._specializationService = _specializationService;
    }
    async getSpecializations(req, res, next) {
        try {
            const hospitalId = req.user?.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const filterStatus = req.query.filter;
            if (!hospitalId) {
                return ApiResponse.unauthorized(res, "Hospital ID not found");
            }
            const result = await this._specializationService.getSpecializations(hospitalId, { page, limit, search, filter: filterStatus });
            return ApiResponse.success(res, "Specializations fetched successfully", result, HttpStatusCode.OK);
        }
        catch (error) {
            next(error);
        }
    }
    async createSpecialization(req, res, next) {
        try {
            const hospitalId = req.user?.userId;
            const specializationData = req.body;
            const file = req.file;
            if (!hospitalId) {
                return ApiResponse.unauthorized(res, "Hospital ID not found");
            }
            const specialization = await this._specializationService.createSpecialization(hospitalId, specializationData, file);
            return ApiResponse.success(res, "Specialization created successfully", specialization, HttpStatusCode.CREATED);
        }
        catch (error) {
            next(error);
        }
    }
    async updateSpecialization(req, res, next) {
        try {
            const { id } = req.params;
            const specializationData = req.body;
            logger.debug(`Updating specialization ${id} with data: ${JSON.stringify(specializationData)}`);
            const file = req.file;
            const specialization = await this._specializationService.updateSpecialization(id, specializationData, file);
            if (!specialization) {
                return ApiResponse.error(res, "Specialization not found", HttpStatusCode.NOT_FOUND);
            }
            return ApiResponse.success(res, "Specialization updated successfully", specialization, HttpStatusCode.OK);
        }
        catch (error) {
            next(error);
        }
    }
    async toggleStatus(req, res, next) {
        try {
            const { id } = req.params;
            const specialization = await this._specializationService.toggleStatus(id);
            if (!specialization) {
                return ApiResponse.error(res, "Specialization not found", HttpStatusCode.NOT_FOUND);
            }
            return ApiResponse.success(res, "Specialization status toggled", specialization, HttpStatusCode.OK);
        }
        catch (error) {
            next(error);
        }
    }
}
