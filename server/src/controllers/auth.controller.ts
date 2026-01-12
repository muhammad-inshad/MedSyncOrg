import type { Request, Response } from "express";
import type { SignupDTO, LoginDTO } from "../dto/auth/signup.dto.ts";
import { AuthService } from "../services/auth.service.ts";

class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async signup(req: Request, res: Response) {
    try {
      const signupData: SignupDTO = req.body;
      const user = await this.authService.signup(signupData);

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error("SIGNUP ERROR ", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create account",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const loginData: LoginDTO = req.body;
      const result = await this.authService.login(loginData);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Login failed",
      });
    }
  }

  async refresh(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    return res.status(200).json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid refresh token",
    });
  }
}


}

export default AuthController;

