import { NextFunction, Request, Response } from "express";

export interface IHospitalAuthController {
    signup: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    loginHospital: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
}
