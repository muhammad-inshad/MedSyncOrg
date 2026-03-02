import { NextFunction, Request, Response } from "express";

export interface ISuperAdminHospitalController {
    hospitalManagement(req: Request, res: Response, next: NextFunction): Promise<void>;
    setActive(req: Request, res: Response, next: NextFunction): Promise<void>;
    hospitalStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    addHospital(req: Request, res: Response, next: NextFunction): Promise<void>;
    editHospital(req: Request, res: Response, next: NextFunction): Promise<void>;
}
