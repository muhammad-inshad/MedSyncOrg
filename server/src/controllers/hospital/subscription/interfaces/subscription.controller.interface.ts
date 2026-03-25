import { NextFunction, Request, Response } from "express";

export interface IHospitalSubscriptionController {
    getActiveSubscriptions(req: Request, res: Response,next:NextFunction): Promise<void>;
}
