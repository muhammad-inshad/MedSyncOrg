import { Request, Response } from "express";
export interface ISuperAdminAuthController {
    login:(req:Request, res:Response) => Promise<Response>;
}