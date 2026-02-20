import { NextFunction, Request, Response } from "express";

export interface IDoctorAuthController {
    registerDoctor: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    loginDoctor: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
}