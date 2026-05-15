// middleware/patient.auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/enums.js";

import { ITokenService } from "../services/token/token.service.interface.js";

import { IUserRepository } from "../repositories/patient/user.repository.interface.js";
import logger from "../utils/logger.js";

export class PatientAuthMiddleware {
  constructor(
    private readonly _tokenService: ITokenService,
    private readonly _userRepo: IUserRepository
  ) { }


  public handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Access token missing" });
      }

      const payload = this._tokenService.verifyAccessToken(token);
  
      if (payload.role !== "patient") {
        logger.warn(`Attempted patient access by role: ${payload.role}`);
        return res.status(HttpStatusCode.FORBIDDEN).json({ message: "Insufficient permissions" });
      }

      const user = await this._userRepo.findById(payload.userId);
      if (!user || user.isActive === false) {
        return res.status(HttpStatusCode.FORBIDDEN).json({ message: "Account is blocked" });
      }
      req.user = payload;
      next();
    } catch (error) {
      logger.error("Patient auth middleware error:", error);
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Invalid or expired token" });
    }
  };
}