import { NextFunction, Request, Response } from "express";

export interface IHospitalSubscriptionController {
    getActiveSubscriptions(req: Request, res: Response,next:NextFunction): Promise<void>;
    downgradeSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCurrentSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
}
