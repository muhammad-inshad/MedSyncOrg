import { NextFunction, Request, Response } from "express";
import { PatientService } from "../services/patient.service.ts";
import { ApiResponse } from "../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../constants/httpStatus.ts";
import { MESSAGES } from "../constants/messages.ts";

class PatientController {
  constructor(private readonly patientService: PatientService) { }

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await this.patientService.getProfile(userId);
      return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, patient);
    } catch (error: unknown) {
      next(error);
    }
  };

  getAllPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const search = (req.query.search as string) || "";

      const result = await this.patientService.getAllPatient({
        page,
        limit,
        search,
      });

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

  patientEdit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedPatient = await this.patientService.updatedPatient(id, req.body);
      return ApiResponse.success(res, MESSAGES.PATIENT.UPDATE_SUCCESS, updatedPatient);
    } catch (error: unknown) {
      next(error);
    }
  };

  getHospitals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitals = await this.patientService.getHospitals();
      return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, hospitals);
    } catch (error: unknown) {
      next(error);
    }
  };

}

export default PatientController;