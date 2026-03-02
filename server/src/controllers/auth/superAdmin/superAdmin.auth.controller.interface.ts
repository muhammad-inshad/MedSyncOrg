import { NextFunction, Request, Response } from "express";
export interface ISuperAdminAuthController {
    login: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
}