import { NextFunction, Request, Response } from 'express';
import { ITokenService } from '../../../../services/token/token.service.interface.js';
import { IPatient } from '../../../../models/Patient.model.js';
import logger from '../../../../utils/logger.js';

export class GoogleAuthController {
  private tokenService: ITokenService;

  constructor(tokenService: ITokenService) {
    this.tokenService = tokenService;
  }

  public async handleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as IPatient;
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      const userPayload = user.toObject ? user.toObject() : user;

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
        secure: true,
        sameSite: "none",
        maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
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
      logger.error("Google Auth Controller Error:", error);
      next(error);
    }
  }
}
