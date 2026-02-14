import type { Request, Response } from "express";
import { SuperAdminService } from "../services/superAdmin.service";
export class SuperAdminController {
  constructor(private readonly service: SuperAdminService) { }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.service.login(email, password);
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
      });
      return res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        user: result.user
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        message: error.message || "Server error",
      });
    }
  };

  hospitalManagement = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const search = req.query.search as string;

      const result = await this.service.hospitalManagement({ page, limit, search });

      return res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        message: error.message || "Server error",
      });
    }
  };

  getme = async (req: Request, res: Response) => {
    try {
      const superAdminId = (req as any).user?.userId;

      if (!superAdminId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No user ID found in request",
        });
      }
      const superAdmin = await this.service.getme(superAdminId);

      return res.status(200).json({
        success: true,
        user: superAdmin,
      });
    } catch (error: any) {
      console.error("GetMe Error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to fetch superadmin profile",
      });
    }
  };

  setActive = async (req: Request, res: Response) => {
    try {
      let { id, isActive } = req.body
      let updated = await this.service.setActive(id, isActive)
      return res.status(200).json({
        success: true,
        data: updated
      })
    } catch (error: any) {
      console.error("setActive Error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to fetch superadmin profile",
      });
    }
  }
}