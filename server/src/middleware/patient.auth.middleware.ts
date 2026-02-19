import { Request,Response,NextFunction } from "express";
import { patientContainer } from "../di/patient.di.ts";
import logger from "../utils/logger.ts";
const { tokenService } = patientContainer();

export function patientAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.accessToken;     
    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }   
    const payload = tokenService.verifyAccessToken(token);
    if (payload.role !== "patient") {
      logger.warn(`Attempted patient access by user with role: ${payload.role}`);
      return res.status(403).json({ message: "Insufficient permissions" });
    }       
    req.user = payload;
    next();
  } catch (error) {     
    logger.error("Patient auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  } 
}