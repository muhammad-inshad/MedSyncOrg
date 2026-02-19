import { Request, Response } from "express";

export interface IPatientOtpAuthController {
    sendOtp: (req: Request, res: Response) => Promise<Response>;
    verifyOtp: (req: Request, res: Response) => Promise<Response>;
}