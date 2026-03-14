import { Request, Response } from "express";

export interface IHospitalSubscriptionController {
    getActiveSubscriptions(req: Request, res: Response): Promise<void>;
}
