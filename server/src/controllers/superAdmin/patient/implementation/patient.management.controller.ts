import { NextFunction, Request, Response } from "express";
import { ISuperAdminPatientManagementService } from "../../../../services/superAdmin/patient/interfaces/patient.management.service.interface.ts";
import { ISuperAdminPatientManagementController } from "../interfaces/patient.management.controller.interface.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";
import { MESSAGES } from "../../../../constants/messages.ts";
import { AuthHOspitalPayload } from "../../../../dto/hospital/hospital-response.dto.ts";

export class SuperAdminPatientManagementController implements ISuperAdminPatientManagementController {
    constructor(private readonly _patientService: ISuperAdminPatientManagementService) { }

    getPatients = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            const search = (req.query.search as string) || "";
            const status = (req.query.status as string) || "All";
            const result = await this._patientService.getAllPatients({ page, limit, search, status });

            return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, result.data, HttpStatusCode.OK, {
                page,
                limit,
                totalItems: result.total,
                totalPages: Math.ceil(result.total / limit),
            });
        } catch (error: unknown) {
            next(error);
        }
    };

    togglePatientActive = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id, isActive } = req.body;
            if (!id) {
                return ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Patient ID is required");
            }
            const result = await this._patientService.togglePatientActive(id, isActive);
            return ApiResponse.success(res, "Patient status updated successfully", result);
        } catch (error: unknown) {
            next(error);
        }
    };

      async addPatient(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
          const hospital = req.user as AuthHOspitalPayload;
          const hospital_id = hospital?.userId;
    
          if (!hospital_id) {
            return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Hospital ID not found");
          }
    
          const patientData = req.body;
          const patientFile = req.file;
    
          const result = await this._patientService.addPatient(patientData, hospital_id, patientFile);
          return ApiResponse.created(res, "Patient added successfully", result);
        } catch (error: unknown) {
          next(error);
        }
      }

       async updatePatient(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
          try {
            const { id } = req.params;
            const patientData = req.body;
            const patientFile = req.file;
            const result = await this._patientService.updatePatient(id, patientData, patientFile);
            return ApiResponse.success(res, "Patient updated successfully", result);
          } catch (error: unknown) {
            next(error);
          }
        }
    
}
