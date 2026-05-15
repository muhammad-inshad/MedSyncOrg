import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
import logger from "../../../../utils/logger.js";
export class DepartmentManagementController {
    constructor(_departmentService) {
        this._departmentService = _departmentService;
    }
    async getDepartments(req, res, next) {
        try {
            const hospitalId = req.user?.userId;
            if (!hospitalId) {
                return ApiResponse.unauthorized(res, "Hospital ID not found in token");
            }
            const { page = 1, limit = 10, search = "", filter } = req.query;
            logger.debug(`Fetching departments with filter: ${filter}`);
            const paginatedDepartments = await this._departmentService.getDepartments(hospitalId, Number(page), Number(limit), search, filter);
            return ApiResponse.success(res, "Departments fetched successfully", paginatedDepartments, HttpStatusCode.OK);
        }
        catch (error) {
            next(error);
        }
    }
    async createDepartment(req, res, next) {
        try {
            const hospitalId = req.user?.userId;
            if (!hospitalId) {
                return ApiResponse.unauthorized(res, "Hospital ID not found in token");
            }
            const departmentData = req.body;
            const file = req.file;
            const department = await this._departmentService.createDepartment(hospitalId, departmentData, file);
            return ApiResponse.success(res, "Department created successfully", department, HttpStatusCode.CREATED);
        }
        catch (error) {
            next(error);
        }
    }
    async updateDepartment(req, res, next) {
        try {
            const { id } = req.params;
            const departmentData = req.body;
            const file = req.file;
            const department = await this._departmentService.updateDepartment(id, departmentData, file);
            if (!department) {
                return ApiResponse.notFound(res, "Department not found");
            }
            return ApiResponse.success(res, "Department updated successfully", department, HttpStatusCode.OK);
        }
        catch (error) {
            next(error);
        }
    }
    async toggleStatus(req, res, next) {
        try {
            const { id } = req.params;
            const department = await this._departmentService.toggleStatus(id);
            if (!department) {
                return ApiResponse.notFound(res, "Department not found");
            }
            return ApiResponse.success(res, "Status toggled successfully", department, HttpStatusCode.OK);
        }
        catch (error) {
            next(error);
        }
    }
}
