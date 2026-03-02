import { Request, Response, NextFunction } from "express";

export interface ISuperAdminDashboardController {
    getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getme(req: Request, res: Response, next: NextFunction): Promise<void>;
}
