import jwt from "jsonwebtoken";
import { ITokenService, ITokenPayload } from "../interfaces/auth.types.ts";

export class TokenService implements ITokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET || "";
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || "";

    if (!this.accessSecret || !this.refreshSecret) {
      throw new Error("JWT secrets not defined in environment variables");
    }
  }

  generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this.accessSecret, { expiresIn: "15m" });
  }

  generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: "7d" });
  }

  verifyRefreshToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as ITokenPayload;
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }
}