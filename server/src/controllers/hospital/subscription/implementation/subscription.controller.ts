import { NextFunction, Request, Response } from "express";
import { IHospitalSubscriptionService } from "../../../../services/hospital/subscription/interfaces/subscription.service.interface.ts";
import { IHospitalSubscriptionController } from "../interfaces/subscription.controller.interface.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";


export class HospitalSubscriptionController implements IHospitalSubscriptionController {
    private subscriptionService: IHospitalSubscriptionService;

    constructor(subscriptionService: IHospitalSubscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    async getActiveSubscriptions(req: Request, res: Response,next:NextFunction): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 6;
        const search = (req.query.search as string) || "";
        
        const result = await this.subscriptionService.getActiveSubscriptions(page, limit, search);
        ApiResponse.success(res, "success", result); 
    } catch (error) {
        next(error);
    }
}

async protection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hospitalId = req.user?.userId;
    if (!hospitalId) {
      ApiResponse.unauthorized(res, "Hospital ID not found");
      return;
    }

    const result = await this.subscriptionService.protection(hospitalId);
    ApiResponse.success(res, "Subscription status fetched", result);

  } catch (error) {
    next(error);
  }
}

 
}
