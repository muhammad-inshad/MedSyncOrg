
import { Request, Response } from "express";

export interface IDoctorAuthController {
    registerDoctor: (req: Request, res: Response) => Promise<Response>;
    loginDoctor: (req: Request, res: Response) => Promise<Response>;
}