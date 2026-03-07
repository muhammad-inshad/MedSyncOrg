import { Request, Response, NextFunction } from "express";

export interface IHospitalController {
    getHospitalProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getSelectedHospital(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    reapply(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    updateHospital(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
