import { NextFunction, Request, Response } from "express";

export interface IPatientAuthController {
    signup: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    refresh: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
}