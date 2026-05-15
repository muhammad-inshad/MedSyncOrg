import { HttpStatusCode } from "../constants/enums.js";
import logger from "../utils/logger.js";
export class DoctorAuthMiddleware {
    constructor(_tokenService, _doctorRepo) {
        this._tokenService = _tokenService;
        this._doctorRepo = _doctorRepo;
        this.handle = async (req, res, next) => {
            try {
                const token = req.cookies?.accessToken;
                if (!token) {
                    return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Access token missing" });
                }
                const payload = this._tokenService.verifyAccessToken(token);
                if (payload.role !== "doctor") {
                    logger.warn(`Attempted doctor access by user with role: ${payload.role}`);
                    return res.status(HttpStatusCode.FORBIDDEN).json({ message: "Insufficient permissions" });
                }
                const doctor = await this._doctorRepo.findById(payload.userId);
                if (!doctor || doctor.isActive === false) {
                    return res.status(HttpStatusCode.FORBIDDEN).json({ message: "Account is blocked" });
                }
                req.user = {
                    ...payload,
                    doctorID: doctor.id
                };
                next();
            }
            catch (error) {
                logger.error("Doctor auth middleware error:", error);
                return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Invalid or expired token" });
            }
        };
    }
}
