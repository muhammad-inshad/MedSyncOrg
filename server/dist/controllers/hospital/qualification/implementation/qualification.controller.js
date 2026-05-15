import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
export class QualificationManagementController {
    constructor(_qualificationService) {
        this._qualificationService = _qualificationService;
    }
    async getQualifications(req, res, next) {
        try {
            const hospitalId = req.user?.userId;
            if (!hospitalId) {
                return ApiResponse.unauthorized(res, "Hospital ID not found in token");
            }
            const { page = 1, limit = 10, search = "", filter } = req.query;
            const paginatedQualifications = await this._qualificationService.getQualifications(hospitalId, Number(page), Number(limit), search, filter);
            return ApiResponse.success(res, "Qualifications fetched successfully", paginatedQualifications, HttpStatusCode.OK);
        }
        catch (error) {
            next(error);
        }
    }
    async createQualification(req, res, next) {
        try {
            const hospitalId = req.user?.userId;
            if (!hospitalId) {
                return ApiResponse.unauthorized(res, "Hospital ID not found in token");
            }
            const qualificationData = req.body;
            const file = req.file;
            const qualification = await this._qualificationService.createQualification(hospitalId, qualificationData, file);
            return ApiResponse.success(res, "Qualification created successfully", qualification, HttpStatusCode.CREATED);
        }
        catch (error) {
            next(error);
        }
    }
    async updateQualification(req, res, next) {
        try {
            const { id } = req.params;
            const qualificationData = req.body;
            const file = req.file;
            const qualification = await this._qualificationService.updateQualification(id, qualificationData, file);
            if (!qualification) {
                return ApiResponse.notFound(res, "Qualification not found");
            }
            return ApiResponse.success(res, "Qualification updated successfully", qualification, HttpStatusCode.OK);
        }
        catch (error) {
            next(error);
        }
    }
    async toggleStatus(req, res, next) {
        try {
            const { id } = req.params;
            const qualification = await this._qualificationService.toggleStatus(id);
            if (!qualification) {
                return ApiResponse.notFound(res, "Qualification not found");
            }
            return ApiResponse.success(res, "Status toggled successfully", qualification, HttpStatusCode.OK);
        }
        catch (error) {
            next(error);
        }
    }
}
