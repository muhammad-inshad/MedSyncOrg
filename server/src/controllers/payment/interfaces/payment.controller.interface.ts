import { Request, Response } from "express";

export interface IPaymentController {
    checkoutPayment(req: Request, res: Response): Promise<void>;
    appointmentCheckout(req: Request, res: Response): Promise<void>;
    upgradeSubscription(req: Request, res: Response): Promise<void>;
    activateDowngradeSubscription(req: Request, res: Response): Promise<void>;
    handleWebhook(req: Request, res: Response): Promise<void>;
}
