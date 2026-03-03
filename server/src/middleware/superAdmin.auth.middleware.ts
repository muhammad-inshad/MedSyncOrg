import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/enums.ts";

import logger from "../utils/logger.ts";
import { superAdminContainer } from "../di/superAdmin.di.ts";
const { tokenService } = superAdminContainer();

export function superAdminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Access token missing" });
        }
        const payload = tokenService.verifyAccessToken(token);
        if (payload.role !== "superadmin") {
            logger.warn(`Attempted superAdmin access by user with role: ${payload.role}`);
            return res.status(HttpStatusCode.FORBIDDEN).json({ message: "Insufficient permissions" });
        }
        req.user = payload;
        next();
    } catch (error) {
        logger.error("SuperAdmin auth middleware error:", error);
        return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Invalid or expired token" });
    }

}