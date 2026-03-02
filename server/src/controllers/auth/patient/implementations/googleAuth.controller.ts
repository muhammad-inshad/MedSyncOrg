import { NextFunction, Request, Response } from 'express';
import { ITokenService } from '../../../../services/token/token.service.interface.ts';
import { IPatient } from '../../../../models/Patient.model.ts';
interface AuthRequest extends Request {
  user?: IPatient;
}
export class GoogleAuthController {
  private tokenService: ITokenService;

  constructor(tokenService: ITokenService) {
    this.tokenService = tokenService;
  }

  public async handleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      const userDoc = authReq.user as IPatient;
      const userPayload = userDoc.toObject ? userDoc.toObject() : userDoc;

      // Get role from state, default to 'patient'
      const role = (req.query.state as string) || 'patient';

      const cleanPayload = {
        userId: userPayload._id.toString(),
        email: userPayload.email,
        role: role
      };
      const accessToken = this.tokenService.generateAccessToken(cleanPayload);
      const refreshToken = this.tokenService.generateRefreshToken(cleanPayload);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1000,
        path: "/",
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const userData = encodeURIComponent(JSON.stringify({
        _id: userPayload._id,
        email: userPayload.email,
        name: userPayload.name,
        role: role
      }));

      return res.redirect(`${frontendUrl}/api/auth/google-success?user=${userData}&role=${role}`);

    } catch (error) {
      console.error("Google Auth Controller Error:", error);
      // For Google Auth, we might still want a redirect, but decentralized error handling
      // usually means next(error). If we want to maintain the redirect, we can do it in the error middleware
      // or keep it here. Given the user's request to "centralize", I'll use next(error).
      next(error);
    }
  }
}