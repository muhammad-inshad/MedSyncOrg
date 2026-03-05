import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../constants/enums.ts";
import { MESSAGES } from "../../constants/messages.ts";

import { IPatientService } from "../../services/patient/patient.service.interfaces.ts";
import { ITokenPayload } from "../../services/token/token.service.interface.ts";

class PatientController {
  constructor(private readonly patientService: IPatientService) { }

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as unknown as ITokenPayload;
      const userId = user?.userId;
      if (!userId) {
        ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED || "Unauthorized");
      }
      const patient = await this.patientService.getProfile(userId);
      return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, patient);
    } catch (error: unknown) {
      next(error);
    }
  };


  updatePatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedPatient = await this.patientService.updateProfile(id, req.body);
      return ApiResponse.success(res, MESSAGES.PATIENT.UPDATE_SUCCESS, updatedPatient);
    } catch (error: unknown) {
      next(error);
    }
  };

  getAllPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = (req.query.search as string) || "";
      console.log("-------------------------")
      const result = await this.patientService.getAllPatient({ page, limit, search });
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

  getHospitals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 6;
      const search = (req.query.search as string) || "";
      const hospitals = await this.patientService.gethospitals(page, limit, search);
      return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, hospitals);
    } catch (error: unknown) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      await this.patientService.changePassword(id, currentPassword, newPassword);
      return ApiResponse.success(res, "Password changed successfully");
    } catch (error: unknown) {
      next(error);
    }
  };

  selectedHospital = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const hospital = await this.patientService.selectedHospital(id);
      return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, hospital);
    } catch (error: unknown) {
      next(error);
    }
  };

}

export default PatientController;