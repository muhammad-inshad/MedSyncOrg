import type { Request, Response } from "express";
import { AdminService } from "../services/admin.service.ts";

export class AdminController {
    private adminService: AdminService;

    constructor(adminService: AdminService) {
        this.adminService = adminService;
    }

    async signup(req: Request, res: Response) {
        try {
            const adminData = req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            const processedFiles = {
                logo: files?.logo ? files.logo[0] : undefined,
                licence: files?.licence ? files.licence[0] : undefined,
            };
            const result = await this.adminService.signup(adminData, processedFiles);
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
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
                path: "/",
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

    async getme(req: Request, res: Response) {
        try {
            const adminID = (req as any).user.userId;
            const Admin = await this.adminService.getAdminProfile(adminID);
            return res.status(200).json({
                success: true,
                data: Admin,
            });
        } catch (error: any) {
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || "Failed to fetch Admin",
            });
        }
    };

    getAllHospitals = async (req: Request, res: Response) => {
        try {
            const hospitals = await this.adminService.getAllHospitals();
            return res.status(200).json({
                success: true,
                data: hospitals,
            });
        } catch (error: any) {
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || "Failed to fetch hospitals",
            });
        }
    };
}

