import { NextFunction, Request, Response } from "express";

export interface IPatientManagementController {
    patientsToggle(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    addPatient(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    updatePatient(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getAllPatient(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
