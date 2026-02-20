import { NextFunction, Request, Response } from "express";

export interface IPatientOtpAuthController {
    sendOtp: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    verifyOtp: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
}