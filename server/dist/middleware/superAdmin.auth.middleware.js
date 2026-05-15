import { HttpStatusCode } from "../constants/enums.js";
import logger from "../utils/logger.js";
import { superAdminContainer } from "../di/superAdmin.di.js";
const { tokenService } = superAdminContainer();
export function superAdminAuthMiddleware(req, res, next) {
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
    }
    catch (error) {
        logger.error("SuperAdmin auth middleware error:", error);
        return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Invalid or expired token" });
    }
}
