
import { randomUUID } from "crypto";
import Logger from "../utils/logger.ts";
import { ITokenService, ITokenPayload, IAccessTokenPayload, IRefreshTokenPayload } from "../interfaces/auth.types.ts";
import jwt, { SignOptions } from "jsonwebtoken";

const { JsonWebTokenError, TokenExpiredError } = jwt;

export class TokenService implements ITokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiry: string;
  private readonly refreshExpiry: string;

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

  generateAccessToken(payload: IAccessTokenPayload): string {
    return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExpiry as SignOptions["expiresIn"] });
  }

  generateRefreshToken(payload: ITokenPayload): string {
    const jti = randomUUID();
    const token = jwt.sign({ ...payload, jti } as IRefreshTokenPayload, this.refreshSecret, { expiresIn: this.refreshExpiry as SignOptions["expiresIn"] });
    Logger.info(`Generated refresh token with JTI: ${jti} for user: ${payload.userId}`);
    return token;
  }

  verifyRefreshToken(token: string): IRefreshTokenPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as IRefreshTokenPayload;
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        Logger.warn("Refresh token expired");
        throw { status: 401, message: "Your session has expired. Please login again." };
      }
      if (error instanceof JsonWebTokenError) {
        Logger.warn("Invalid refresh token signature");
        throw { status: 401, message: "Invalid token signature." };
      }
      Logger.error("Refresh token verification failed", error);
      throw { status: 401, message: "Authentication failed" };
    }
  }

  verifyAccessToken(token: string): IAccessTokenPayload {
    try {
      return jwt.verify(token, this.accessSecret) as IAccessTokenPayload;
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        Logger.warn("Access token expired");
        throw { status: 401, message: "Your session has expired." };
      }
      if (error instanceof JsonWebTokenError) {
        Logger.warn("Invalid access token signature");
        throw { status: 401, message: "Invalid token signature." };
      }
      Logger.error("Access token verification failed", error);
      throw { status: 401, message: "Authentication failed" };
    }
  }
}