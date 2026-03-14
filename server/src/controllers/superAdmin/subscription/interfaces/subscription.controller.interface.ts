import { Request, Response, NextFunction } from "express";

export interface ISubscriptionController {
    addSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggleSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
}
