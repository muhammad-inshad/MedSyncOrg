import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { MESSAGES } from "../../../../constants/messages.js";
export class HospitalController {
    constructor(_hospitalService) {
        this._hospitalService = _hospitalService;
    }
    async getHospitalProfile(req, res, next) {
        try {
            const user = req.user;
            const hospitalId = user.userId;
            const result = await this._hospitalService.getHospitalProfile(hospitalId);
            return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getSelectedHospital(req, res, next) {
        try {
            const { id } = req.params;
            const { page, limit, search } = req.query;
            const result = await this._hospitalService.getSelectedHospital(id, page ? Number(page) : undefined, limit ? Number(limit) : undefined, search);
            return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    async reapply(req, res, next) {
        try {
            const user = req.user;
            const hospitalId = user.userId;
            const result = await this._hospitalService.updateHospitalStatusReapply(hospitalId);
            return ApiResponse.success(res, "Re-application submitted successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateHospital(req, res, next) {
        try {
            const user = req.user;
            const id = user.userId;
            const hospitalData = req.body;
            const files = req.files;
            const result = await this._hospitalService.updateHospital(id, hospitalData, files);
            return ApiResponse.success(res, MESSAGES.ADMIN.UPDATE_SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
}
