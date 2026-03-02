// middleware/patient.auth.middleware.ts
import { Request, Response, NextFunction } from "express";
<<<<<<< HEAD
import { TokenService } from "../services/token.service.ts";
=======
import { ITokenService } from "../services/token/token.service.interface.ts";
>>>>>>> c8a5339 (fix: final removal of secrets and hospital edit logic)
import { IUserRepository } from "../repositories/patient/user.repository.interface.ts";
import logger from "../utils/logger.ts";

export class PatientAuthMiddleware {
  constructor(
<<<<<<< HEAD
    private readonly _tokenService: TokenService,
    private readonly _userRepo: IUserRepository // Added to check for blocked status
  ) {}
=======
    private readonly _tokenService: ITokenService,
    private readonly _userRepo: IUserRepository 
  ) { }
>>>>>>> c8a5339 (fix: final removal of secrets and hospital edit logic)

  public handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) {
        return res.status(401).json({ message: "Access token missing" });
      }

      const payload = this._tokenService.verifyAccessToken(token);

      if (payload.role !== "patient") {
        logger.warn(`Attempted patient access by role: ${payload.role}`);
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      // Check if user is blocked in real-time
      const user = await this._userRepo.findById(payload.userId);
      if (!user || user.isActive === false) {
        return res.status(403).json({ message: "Account is blocked" });
      }

      req.user = payload;
      next();
    } catch (error) {
      logger.error("Patient auth middleware error:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}