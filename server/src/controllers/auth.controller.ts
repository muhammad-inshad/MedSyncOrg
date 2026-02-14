import type { Request, Response } from "express";
import type { SignupDTO, LoginDTO } from "../dto/auth/signup.dto";
import { AuthService } from "../services/auth.service";

class AuthController {
  constructor(private readonly authService: AuthService) { }

  signup = async (req: Request, res: Response) => {
    try {
      const signupData: SignupDTO = req.body;
      const user = await this.authService.signup(signupData);

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        user,
      });
    } catch (error: any) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Failed to create account",
      });
    }
  };

  login = async (req: Request, res: Response) => {
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
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: { ...result.user, role: loginData.role },
      });
    } catch (error: any) {
      return res.status(error.status || 401).json({
        success: false,
        message: error.message || "Login failed",
      });
    }
  };

  refresh = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ success: false, message: "Session expired" });
      }
      const result = await this.authService.refreshAccessToken(refreshToken);
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
        path: "/",
      });
      return res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      return res.status(401).json({ success: false, message: "Invalid session" });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { email, password, role } = req.body
      const result = await this.authService.resetPassword(email, password, role);
      return res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
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

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  };
}

export default AuthController;