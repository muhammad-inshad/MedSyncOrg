// middlewares/hospital.auth.middleware.ts
import { Request, Response, NextFunction } from "express";

import logger from "../utils/logger.ts";
import { IHospitalRepository } from "../repositories/hospital/hospital.repository.interface.ts";
import { ITokenService } from "../services/token/token.service.interface.ts";

export class HospitalAuthMiddleware {
  constructor(
    private tokenService: ITokenService,
    private hospitalRepo: IHospitalRepository
  ) { }


  public handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) {
        return res.status(401).json({ message: "Access token missing" });
      }

      const payload = this.tokenService.verifyAccessToken(token);

      if (payload.role !== "hospital") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }


      const hospital = await this.hospitalRepo.findById(payload.userId);

      if (!hospital || hospital.isActive === false) {
        logger.warn(`Access denied: Hospital ${payload.userId} is inactive or not found.`);
        return res.status(403).json({ message: "Account is blocked or inactive" });
      }



      req.user = payload;
      next();
    } catch (error) {
      logger.error("Hospital auth middleware error:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}