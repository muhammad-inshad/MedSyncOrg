import type { Request, Response } from "express";
import { PatientService } from "../service/Patient.service";

class PatientController {
  constructor(private readonly patientService: PatientService) {}

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
}

export default PatientController;