import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
import logger from "../../../../utils/logger.js";
export class SuperAdminHospitalController {
    constructor(service) {
        this.service = service;
        this.hospitalManagement = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 8;
                const search = req.query.search;
                const status = req.query.status;
                let isActive;
                if (status === "Active")
                    isActive = true;
                else if (status === "Inactive")
                    isActive = false;
                const result = await this.service.hospitalManagement({ page, limit, search, isActive });
                ApiResponse.success(res, "Hospital management data fetched successfully", result.data, HttpStatusCode.OK, {
                    page,
                    limit,
                    totalItems: result.total,
                    totalPages: Math.ceil(result.total / limit)
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.setActive = async (req, res, next) => {
            try {
                const { id, isActive } = req.body;
                if (!id || isActive === undefined) {
                    ApiResponse.validationError(res, "Missing required parameters: id and isActive");
                    return;
                }
                const result = await this.service.setActive(id, isActive);
                ApiResponse.success(res, "Hospital status updated successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
        this.hospitalStatus = async (req, res, next) => {
            try {
                const { id, status } = req.params;
                const { rejectionReason } = req.body;
                const result = await this.service.updateHospitalStatus(id, status, rejectionReason);
                ApiResponse.success(res, "Hospital status updated successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
        this.addHospital = async (req, res, next) => {
            try {
                const hospitalData = req.body;
                const files = req.files;
                const result = await this.service.addHospital(hospitalData, {
                    logo: files?.logo?.[0],
                    licence: files?.licence?.[0]
                });
                ApiResponse.success(res, "Hospital created successfully", result, HttpStatusCode.CREATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.editHospital = async (req, res, next) => {
            try {
                const { id } = req.params;
                const updateData = req.body;
                const files = req.files;
                if (updateData && updateData.subscription && typeof updateData.subscription === 'string') {
                    try {
                        updateData.subscription = JSON.parse(updateData.subscription);
                    }
                    catch (e) {
                        logger.error("Failed to parse subscription", e);
                    }
                }
                const result = await this.service.editHospital(id, updateData, {
                    logo: files?.logo?.[0],
                    licence: files?.licence?.[0]
                });
                ApiResponse.success(res, "Hospital updated successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
