import { NextFunction, Request, Response } from "express";
import { IPatientManagementService } from "../../../../services/hospital/patient/interfaces/patient.management.service.interface.js";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { IPatientManagementController } from "../interfaces/patient.management.controller.interface.js";
import { MESSAGES } from "../../../../constants/messages.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
import { AuthHOspitalPayload } from "../../../../dto/hospital/hospital-response.dto.js";

export class PatientManagementController implements IPatientManagementController {
  constructor(private readonly _patientManagementService: IPatientManagementService) { }

  async addPatient(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const hospital = req.user as AuthHOspitalPayload;
      const hospital_id = hospital?.userId;

      if (!hospital_id) {
        return ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Hospital ID not found");
      }

      const patientData = req.body;
      const patientFile = req.file;

      const result = await this._patientManagementService.addPatient(patientData, hospital_id, patientFile);
      return ApiResponse.created(res, "Patient added successfully", result);
    } catch (error: unknown) {
      next(error);
    }
  }

  async patientsToggle(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const result = await this._patientManagementService.patientsToggle(id);
      return ApiResponse.success(res, "Patient status toggled successfully", result);
    } catch (error: unknown) {
      next(error);
    }
  }

  async updatePatient(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const patientData = req.body;
      const patientFile = req.file;
      const result = await this._patientManagementService.updatePatient(id, patientData, patientFile);
      return ApiResponse.success(res, "Patient updated successfully", result);
    } catch (error: unknown) {
      next(error);
    }
  }

  getAllPatient = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = (req.query.search as string) || "";
      const hospital = req.user as AuthHOspitalPayload;
      const hospital_id = hospital?.userId;
      const filter= req.query.filter as "all" | "active" | "blocked" | undefined;
      const result = await this._patientManagementService.getAllPatient({ page, limit, search,filter, hospital_id });

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

}
