import { NextFunction, Request, Response } from "express";

export interface IDoctorManagementController {
    getAllDoctors(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getAllKycDoctors(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    doctorsToggle(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    acceptDoctor(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    rejectDoctor(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    requestRevisionDoctor(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    registerDoctor(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    updateDoctor(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
