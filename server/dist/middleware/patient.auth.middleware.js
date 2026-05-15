import { HttpStatusCode } from "../constants/enums.js";
import logger from "../utils/logger.js";
export class PatientAuthMiddleware {
    constructor(_tokenService, _userRepo) {
        this._tokenService = _tokenService;
        this._userRepo = _userRepo;
        this.handle = async (req, res, next) => {
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
            }
            catch (error) {
                logger.error("Patient auth middleware error:", error);
                return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Invalid or expired token" });
            }
        };
    }
}
