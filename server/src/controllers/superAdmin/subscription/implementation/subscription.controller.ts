import { NextFunction, Request, Response } from "express";
import { ISubscriptionController } from "../interfaces/subscription.controller.interface.ts";
import { ISubscriptionService } from "../../../../services/superAdmin/subscription/interfaces/subscription.service.interface.ts";
import {  UpdateSubscriptionDTO } from "../../../../dto/subscription/subscription-response.dto.ts";
import { MESSAGES } from "../../../../constants/messages.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";

export class SubscriptionController implements ISubscriptionController {
    constructor(private readonly subscriptionService: ISubscriptionService) {}

       async addSubscription(req: Request, res: Response,next:NextFunction): Promise<void> {
        try {
       
      const subscription = await this.subscriptionService.createSubscription({
        ...req.body, 
      });
       ApiResponse.success(res, MESSAGES.UPDATION.ADDED, subscription);
        } catch (error) {
            next(error)
        }
    }

    async getSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";
            const status = (req.query.status as string) || "All";
            const { data, total } = await this.subscriptionService.getAllSubscriptions(page, limit, search, status);

            res.status(200).json({
                success: true,
                message: "Subscriptions fetched successfully",
                data,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async toggleSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id, isActive } = req.body;
            const updatedSubscription = await this.subscriptionService.toggleSubscription(id, isActive);
            
            res.status(200).json({
                success: true,
                message: "Subscription status updated successfully",
                data: updatedSubscription
            });
        } catch (error) {
            next(error);
        }
    }

    async updateSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body as UpdateSubscriptionDTO;
        
            const updatedSubscription = await this.subscriptionService.updateSubscription(id, updateData);
            
            if (!updatedSubscription) {
                res.status(404).json({ success: false, message: "Subscription not found" });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Subscription updated successfully",
                data: updatedSubscription
            });
        } catch (error) {
            next(error);
        }
    }

    async subscribeHospital(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const page=Number(req.query.page)||1;
            const limit=Number(req.query.limit)||5;
            const search = (req.query.search as string) || "";
            const filter = (req.query.filter as string) || undefined;

            const result=await this.subscriptionService.subscribeHospital(  page,limit, search,filter);
            ApiResponse.success(res,"sucess",result)
        } catch (error) {
            next(error)
        }
    }
}
