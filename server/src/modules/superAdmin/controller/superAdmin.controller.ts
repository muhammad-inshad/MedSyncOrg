import type { Request, Response } from "express";
import { SuperAdminService } from "../service/superAdmin.service.ts";

export class SuperAdminController {
  private service: SuperAdminService;

  constructor(service: SuperAdminService) {
    this.service = service;
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.service.login(req);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({
        message: error.message || "Server error",
      });
    }
  }

async hospitalManagement(req: Request, res: Response) {
    try {
      const hospitals = await this.service.hospitalManagement();
      res.status(200).json({ hospitals });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Server error",
      });
    }
  }
}
