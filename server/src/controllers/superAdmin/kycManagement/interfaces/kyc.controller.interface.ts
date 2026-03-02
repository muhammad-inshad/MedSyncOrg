import { NextFunction, Request, Response } from "express";

export interface ISuperAdminKycController {
    hospitals(req: Request, res: Response, next: NextFunction): Promise<void>;
}
