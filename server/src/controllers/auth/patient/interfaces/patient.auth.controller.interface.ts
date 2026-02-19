import { Request, Response } from "express";

export interface IPatientAuthController {
    signup: (req: Request, res: Response) => Promise<Response>;
    login: (req: Request, res: Response) => Promise<Response>;
    resetPassword: (req: Request, res: Response) => Promise<Response>;
    refresh: (req: Request, res: Response) => Promise<Response>;
}