import { NextFunction, Request, Response } from "express";
import { IPatientAuthService } from "../../../../services/auth/patient/interfaces/patient.auth.service.interface.ts";
import { LoginDTO, SignupDTO } from "../../../../dto/auth/signup.dto.ts";
import { IPatientAuthController } from "../interfaces/patient.auth.controller.interface.ts";
import { MESSAGES } from "../../../../constants/messages.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";

class patientAuthController implements IPatientAuthController {

  constructor(private readonly authService: IPatientAuthService) { }

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signupData: SignupDTO = req.body;
      const user = await this.authService.signup(signupData);

      return ApiResponse.created(res, "Account created successfully", user);
    } catch (error: unknown) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginDTO = req.body;

      const result = await this.authService.login(loginData);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
        path: "/",
      });

      return ApiResponse.success(res, "Login successful", {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: { ...result.user, role: loginData.role }
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        refreshToken = req.body?.refreshToken;
      }

      if (!refreshToken) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Refresh ")) {
          refreshToken = authHeader.substring(8);
        }
      }

      if (!refreshToken) {
        return ApiResponse.unauthorized(res, MESSAGES.AUTH.SESSION_EXPIRED || "Session expired");
      }

      const result = await this.authService.refreshAccessToken(refreshToken);
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
        path: "/",
      });
      return ApiResponse.success(res, "Token refreshed successfully", {
        accessToken: result.accessToken
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, role } = req.body
      const result = await this.authService.resetPassword(email, password, role);
      return ApiResponse.success(res, result.message);
    } catch (error: unknown) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response) => {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return ApiResponse.success(res, MESSAGES.AUTH.LOGOUT_SUCCESS);
  };
}

export default patientAuthController;