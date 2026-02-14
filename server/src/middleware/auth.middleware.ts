import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { StatusCode } from "../constants/statusCodes.ts";
import { MESSAGES } from "../constants/messages.ts";

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.AUTH.UNAUTHORIZED,
      });
      return;
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(StatusCode.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.AUTH.SESSION_EXPIRED,
    });
  }
};