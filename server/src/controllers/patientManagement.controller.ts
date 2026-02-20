import { NextFunction, Request, Response } from "express";
import { patientManagementService } from "../services/patientManagement.service.ts";
import { ApiResponse } from "../utils/apiResponse.utils.ts";

export class PatientManagementController {
  private patientservice: patientManagementService;

  constructor(patientservice: patientManagementService) {
    this.patientservice = patientservice;
  }

  async patientToggle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatePatient = await this.patientservice.togglePatientStatus(id)
      return ApiResponse.success(res, `Patient ${updatePatient?.isActive ? 'activated' : 'deactivated'} successfully`, updatePatient);
    } catch (error: any) {
      next(error);
    }
  }

  async patientAdd(req: Request, res: Response, next: NextFunction) {
    try {
      const patientData = req.body
      const file = req.file
      if (!file) {
        return ApiResponse.validationError(res, "Profile image is required");
      }
      const result = await this.patientservice.createPatient(patientData, file)
      return ApiResponse.created(res, "Patient created successfully", result);
    } catch (error: any) {
      next(error);
    }
  }
}