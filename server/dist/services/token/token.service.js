import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import Logger from "../../utils/logger.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../constants/enums.js";
const { JsonWebTokenError, TokenExpiredError } = jwt;
export class TokenService {
    constructor() {
        this.accessSecret = process.env.JWT_ACCESS_SECRET || "";
        this.refreshSecret = process.env.JWT_REFRESH_SECRET || "";
        this.accessExpiry = process.env.JWT_ACCESS_EXPIRY || "15m";
        this.refreshExpiry = process.env.JWT_REFRESH_EXPIRY || "7d";
        if (!this.accessSecret || !this.refreshSecret) {
            Logger.error("JWT secrets not defined in environment variables");
            throw new Error("JWT secrets not defined in environment variables");
        }
    }
    generateAccessToken(payload) {
        return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExpiry });
    }
    generateRefreshToken(payload) {
        const jti = randomUUID();
        const token = jwt.sign({ ...payload, jti }, this.refreshSecret, { expiresIn: this.refreshExpiry });
        Logger.info(`Generated refresh token with JTI: ${jti} for user: ${payload.userId}`);
        return token;
    }
    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.refreshSecret);
        }
        catch (error) {
            if (error instanceof TokenExpiredError) {
                Logger.warn("Refresh token expired");
                ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Your session has expired. Please login again.");
            }
            if (error instanceof JsonWebTokenError) {
                Logger.warn("Invalid refresh token signature");
                ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Invalid token signature.");
            }
            Logger.error("Refresh token verification failed", error);
            ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Authentication failed");
        }
    }
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, this.accessSecret);
        }
        catch (error) {
            if (error instanceof TokenExpiredError) {
                Logger.warn("Access token expired");
                ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Your session has expired.");
            }
            if (error instanceof JsonWebTokenError) {
                Logger.warn("Invalid access token signature");
                ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Invalid token signature.");
            }
            Logger.error("Access token verification failed", error);
            ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Authentication failed");
        }
    }
}
