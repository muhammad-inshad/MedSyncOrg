import { Request,Response,NextFunction } from "express";
import {adminContainer} from "../di/admin.di.ts"
import logger from "../utils/logger.ts";
const { tokenService } = adminContainer();
export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }

    const payload = tokenService.verifyAccessToken(token);
    if (payload.role !== "admin") {
      logger.warn(`Attempted admin access by user with role: ${payload.role}`);
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    req.user = payload;
    next();
  } catch (error) {
    logger.error("Admin auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}