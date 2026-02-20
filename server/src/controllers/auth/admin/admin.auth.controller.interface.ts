import { NextFunction, Request, Response } from "express";

export interface IAdminAuthController {
    signup: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
    loginAdmin: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
}