import type { Request, Response } from "express";
import type { SignupDTO, LoginDTO } from "../dto/auth/signup.dto.ts";
import { IAuthService } from "../services/auth/auth.service.interface.ts";

class AuthController {

    constructor(private readonly authService: IAuthService) { }

    signup = async (req: Request, res: Response) => {
        try {
            const signupData: SignupDTO = req.body;
            const user = await this.authService.signup(signupData);

            return res.status(201).json({
                success: true,
                message: "Account created successfully",
                user,
            });
        } catch (error: unknown) {
            // Safe error handling
            const errorMessage = (error as any).message || "Failed to create account";
            const errorStatus = (error as any).status || 400;

            return res.status(errorStatus).json({
                success: false,
                message: errorMessage,
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
                data: {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    user: { ...result.user, role: loginData.role }
                }
            });
        } catch (error: unknown) {
            const errorMessage = (error as any).message || "Login failed";
            const errorStatus = (error as any).status || 401;

            return res.status(errorStatus).json({
                success: false,
                message: errorMessage,
            });
        }
    };

    refresh = async (req: Request, res: Response) => {
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
                data: {
                    accessToken: result.accessToken
                }
            });
        } catch (error: unknown) {
            return res.status(401).json({ success: false, message: "Invalid session" });
        }
    };

    resetPassword = async (req: Request, res: Response) => {
        try {
            const { email, password, role } = req.body
            const result = await this.authService.resetPassword(email, password, role);
            return res.status(200).json({ success: true, message: result.message });
        } catch (error: unknown) {
            const errorMessage = (error as any).message || "Internal Server Error";
            const errorStatus = (error as any).status || 500;

            return res.status(errorStatus).json({
                success: false,
                message: errorMessage,
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
