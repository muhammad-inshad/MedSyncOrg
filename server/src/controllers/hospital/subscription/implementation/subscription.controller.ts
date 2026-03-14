import { Request, Response } from "express";
import { IHospitalSubscriptionService } from "../../../../services/hospital/subscription/interfaces/subscription.service.interface.ts";
import { IHospitalSubscriptionController } from "../interfaces/subscription.controller.interface.ts";

export class HospitalSubscriptionController implements IHospitalSubscriptionController {
    private subscriptionService: IHospitalSubscriptionService;

    constructor(subscriptionService: IHospitalSubscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    async getActiveSubscriptions(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 6;
            const search = (req.query.search as string) || "";
            
            const result = await this.subscriptionService.getActiveSubscriptions(page, limit, search);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server error while fetching subscriptions." });
        }
    }
}
