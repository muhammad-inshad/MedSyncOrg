import type { Request, Response } from "express";
import { UserRepository } from "../../../repositories/user.repository.ts";

class PatientController {
  private userRepo: UserRepository;

  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const patient = await this.userRepo.findById(userId);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: patient,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch patient",
      });
    }
  }
}

export default PatientController;
