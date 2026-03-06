import { NextFunction, Request, Response } from "express";

export interface IDoctorAuthController {
    registerDoctor: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    loginDoctor: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    selectHospitals: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    getHospitalDepartments: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    getHospitalQualifications: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    getHospitalSpecializations: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
}