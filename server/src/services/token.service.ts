import jwt from "jsonwebtoken";

export class TokenService {
  private accessSecret: string;
  private refreshSecret: string;

  constructor() {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets not defined");
    }

    this.accessSecret = process.env.JWT_ACCESS_SECRET;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET;
  }

  generateAccessToken(userId: string, email: string, role: string) {
    return jwt.sign(
      { userId, email, role },
      this.accessSecret,
      { expiresIn: "15m" }
    );
  }

  generateRefreshToken(userId: string, email: string, role: string) {
    return jwt.sign(
      { userId, email, role },
      this.refreshSecret,
      { expiresIn: "7d" }
    );
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(token, this.refreshSecret) as {
      userId: string;
      email: string;
      role: string;
    };
  }
  
}
