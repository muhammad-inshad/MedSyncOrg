import type { Request, Response } from "express";
import { DoctorService } from "../service/doctor.service.ts";

class DoctorController {
    private doctorService: DoctorService
    constructor(doctorService: DoctorService) {
        this.doctorService = doctorService
    }

    async RegistorDoctor(req: Request, res: Response) {
        try {
            const doctor = await this.doctorService.registerDoctor(
                req.body,
                req.files
            );

            return res.status(201).json({
                success: true,
                message: "Doctor registered successfully",
                data: doctor,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to register doctor",
            });
        }
    }

    async loginDoctor(req: Request, res: Response) {
        try {
            const data=req.body
            const result = await this.doctorService.loginDoctor(data);
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
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || "Login failed",
            });
        }
    }
}

export default DoctorController