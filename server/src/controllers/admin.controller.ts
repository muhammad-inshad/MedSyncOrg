import type { Request, Response } from "express";
import { AdminService } from "../services/admin.service.ts";

export class AdminController {
    private adminService: AdminService;

    constructor(adminService: AdminService) {
        this.adminService = adminService;
    }

    async signup(req: Request, res: Response) {
        try {
            const result = await this.adminService.signup(req);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({
                message: error.message || "Server error",
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const data = req.body
            const result = await this.adminService.loginAdmin(data)
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.status(200).json({
                success: true,
                message: "Doctor login successful",
                user: result.user,
                accessToken: result.accessToken,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({
                message: error.message || "Server error",
            });
        }
    }
}
