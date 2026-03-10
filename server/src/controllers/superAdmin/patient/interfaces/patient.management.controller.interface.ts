import { NextFunction, Request, Response } from "express";

export interface ISuperAdminPatientManagementController {
    getPatients(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    togglePatientActive(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
