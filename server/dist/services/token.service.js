import jwt from "jsonwebtoken";
export class TokenService {
    constructor() {
        this.accessSecret = process.env.JWT_ACCESS_SECRET || "";
        this.refreshSecret = process.env.JWT_REFRESH_SECRET || "";
        if (!this.accessSecret || !this.refreshSecret) {
            throw new Error("JWT secrets not defined in environment variables");
        }
    }
    generateAccessToken(payload) {
        return jwt.sign(payload, this.accessSecret, { expiresIn: "15m" });
    }
    generateRefreshToken(payload) {
        return jwt.sign(payload, this.refreshSecret, { expiresIn: "7d" });
    }
    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.refreshSecret);
        }
        catch (error) {
            throw new Error("Invalid or expired refresh token");
        }
    }
}
