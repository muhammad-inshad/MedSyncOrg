import { NextFunction, Request, Response } from "express";
import { IDepartmentService } from "../../../../services/hospital/department/interfaces/department.service.interface.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";
import { IDepartment } from "../../../../models/department.model.ts";

export class DepartmentManagementController {
    constructor(private readonly _departmentService: IDepartmentService) { }

    async getDepartments(req: Request, res: Response, next: NextFunction) {
        try {
            const hospitalId = req.user?.userId;
            if (!hospitalId) {
                return ApiResponse.unauthorized(res, "Hospital ID not found in token");
            }
            const departments = await this._departmentService.getDepartments(hospitalId);
            return ApiResponse.success(res, "Departments fetched successfully", departments, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }

    async createDepartment(req: Request, res: Response, next: NextFunction) {
        try {
            const hospitalId = req.user?.userId;
            if (!hospitalId) {
                return ApiResponse.unauthorized(res, "Hospital ID not found in token");
            }
            const departmentData: Partial<IDepartment> = req.body;
            const file = req.file;
            const department = await this._departmentService.createDepartment(hospitalId, departmentData, file);
            return ApiResponse.success(res, "Department created successfully", department, HttpStatusCode.CREATED);
        } catch (error) {
            next(error);
        }
    }

    async toggleStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const department = await this._departmentService.toggleStatus(id);
            if (!department) {
                return ApiResponse.notFound(res, "Department not found");
            }
            return ApiResponse.success(res, "Status toggled successfully", department, HttpStatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
}