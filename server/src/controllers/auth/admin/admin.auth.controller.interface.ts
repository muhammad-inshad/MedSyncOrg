import { Request, Response } from "express";

export interface IAdminAuthController {
    signup:(req:Request, res:Response) => Promise<Response>;
    loginAdmin:(req:Request, res:Response) => Promise<Response>;
}