import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
import { MESSAGES } from "../../../../constants/messages.js";
import logger from "../../../../utils/logger.js";
export class DoctorManagementController {
    constructor(_doctorManagementService) {
        this._doctorManagementService = _doctorManagementService;
        this.getAllKycDoctors = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const search = req.query.search;
                const status = req.query.filter; // 'all' | 'pending' | 'revision' | 'rejected'
                const hospital = req.user;
                const hospital_id = hospital?.userId;
                const filter = {
                    licence: { $exists: true, $ne: "" },
                    reviewStatus: { $ne: "approved" }
                };
                if (hospital_id) {
                    filter.hospital_id = hospital_id.toString();
                }
                const result = await this._doctorManagementService.getAllDoctors({ page, limit, search, filter, status });
                return ApiResponse.success(res, "KYC Doctors fetched successfully", result.data, HttpStatusCode.OK, {
                    page,
                    limit,
                    totalItems: result.total,
                    totalPages: Math.ceil(result.total / limit),
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
    async getAllDoctors(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search;
            const hospital = req.user;
            const hospital_id = hospital?.userId;
            const filterStatus = req.query.filter;
            const filter = {
                reviewStatus: "approved"
            };
            if (hospital_id) {
                filter.hospital_id = hospital_id.toString();
            }
            if (filterStatus === "active") {
                filter.isActive = true;
            }
            else if (filterStatus === "blocked") {
                filter.isActive = false;
            }
            const result = await this._doctorManagementService.getAllDoctors({ page, limit, search, filter });
            return ApiResponse.success(res, "Doctors fetched successfully", result.data, HttpStatusCode.OK, {
                page,
                limit,
                totalItems: result.total,
                totalPages: Math.ceil(result.total / limit),
            });
        }
        catch (error) {
            next(error);
        }
    }
    ;
    async doctorsToggle(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this._doctorManagementService.doctorsToggle(id);
            return ApiResponse.success(res, "Doctor status toggled successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    async acceptDoctor(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this._doctorManagementService.acceptDoctor(id);
            return ApiResponse.success(res, "Doctor accepted successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    async rejectDoctor(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const result = await this._doctorManagementService.rejectDoctor(id, reason);
            return ApiResponse.success(res, "Doctor rejected successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    async requestRevisionDoctor(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const result = await this._doctorManagementService.requestRevisionDoctor(id, reason);
            return ApiResponse.success(res, "Doctor revision requested successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    async registerDoctor(req, res, next) {
        try {
            const files = req.files;
            const doctorData = req.body;
            const hospital = req.user;
            const hospital_id = hospital?.userId;
            if (!hospital_id) {
                return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Hospital ID not found");
            }
            const doctor = await this._doctorManagementService.registerDoctor(doctorData, files, hospital_id.toString());
            return ApiResponse.created(res, MESSAGES.DOCTOR.REGISTER_SUCCESS, doctor);
        }
        catch (error) {
            next(error);
        }
    }
    async updateDoctor(req, res, next) {
        try {
            const { id } = req.params;
            const files = req.files;
            const doctorData = req.body;
            logger.debug(`Updating doctor ${id} with data: ${JSON.stringify(doctorData)}`);
            const result = await this._doctorManagementService.updateDoctor(id, doctorData, files);
            return ApiResponse.success(res, "Doctor profile updated successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    async getLeaveDoctors(req, res, next) {
        try {
            const hospital = req.user;
            const hospitalId = hospital?.userId?.toString() || "";
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search;
            const dateStr = req.query.date;
            const date = dateStr ? new Date(dateStr) : undefined;
            const result = await this._doctorManagementService.getLeaveDoctors({
                hospitalId,
                page,
                limit,
                search,
                date
            });
            return ApiResponse.success(res, "Doctor leaves fetched successfully", result.data, HttpStatusCode.OK, {
                page: result.page,
                limit: result.limit,
                totalItems: result.total,
                totalPages: Math.ceil(result.total / result.limit),
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateLeaveStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, rejectedReason } = req.body;
            if (!status || !['approved', 'rejected'].includes(status)) {
                return ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Invalid status");
            }
            const result = await this._doctorManagementService.updateLeaveStatus(id, status, rejectedReason);
            return ApiResponse.success(res, `Leave ${status} successfully`, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getDoctorDetails(req, res) {
        const { id } = req.params;
        const result = await this._doctorManagementService.getDoctorDetails(id);
        logger.debug(`Fetched doctor details for ${id}`);
        return ApiResponse.success(res, "success", result);
    }
    async getDeptSpecs(req, res, next) {
        try {
            const user = req.user;
            const hospitalId = user.userId;
            const result = await this._doctorManagementService.getDeptSpecs(hospitalId);
            return ApiResponse.success(res, "success", result);
        }
        catch (error) {
            next(error);
        }
    }
}
