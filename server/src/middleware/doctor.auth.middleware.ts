import { Request, Response, NextFunction } from "express";
import { ITokenService } from "../services/token/token.service.interface.ts";

import { IDoctorRepository } from "../repositories/doctor/doctor.repository.interface.ts";
import logger from "../utils/logger.ts";

export class DoctorAuthMiddleware {
  constructor(
    private readonly _tokenService: ITokenService,

    private readonly _doctorRepo: IDoctorRepository
  ) { }

  public handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) {
        return res.status(401).json({ message: "Access token missing" });
      }

      const payload = this._tokenService.verifyAccessToken(token);

      if (payload.role !== "doctor") {
        logger.warn(`Attempted doctor access by user with role: ${payload.role}`);
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      // Check if doctor is blocked in real-time
      const doctor = await this._doctorRepo.findById(payload.userId);
      if (!doctor || doctor.isActive === false) {
        return res.status(403).json({ message: "Account is blocked" });
      }

      req.user = payload;
      next();
    } catch (error) {
      logger.error("Doctor auth middleware error:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}