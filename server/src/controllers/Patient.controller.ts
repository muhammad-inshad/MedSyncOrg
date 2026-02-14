import type { Request, Response } from "express";
import { PatientService } from "../services/patient.service.ts";

class PatientController {
  constructor(private readonly patientService: PatientService) { }

  getMe = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const patient = await this.patientService.getProfile(userId);
      return res.status(200).json({
        success: true,
        data: patient,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to fetch patient",
      });
    }
  };

  getAllPatient = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const search = (req.query.search as string) || "";

      const result = await this.patientService.getAllPatient({
        page,
        limit,
        search,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  };

  patientEdit = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const file = (req as any).file;
      const updatedPatient = await this.patientService.updatedPatient(id, req.body);
      return res.status(200).json({
        success: true,
        message: "patient updated successfully",
        data: updatedPatient
      });
    } catch (error: any) {
      console.error("Controller Error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to update doctor"
      });
    }
  }

}



export default PatientController;