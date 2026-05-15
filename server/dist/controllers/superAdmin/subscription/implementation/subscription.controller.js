import { MESSAGES } from "../../../../constants/messages.js";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
export class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async addSubscription(req, res, next) {
        try {
            const subscription = await this.subscriptionService.createSubscription({
                ...req.body,
            });
            ApiResponse.success(res, MESSAGES.UPDATION.ADDED, subscription);
        }
        catch (error) {
            next(error);
        }
    }
    async getSubscriptions(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const status = req.query.status || "All";
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
        }
        catch (error) {
            next(error);
        }
    }
    async toggleSubscription(req, res, next) {
        try {
            const { id, isActive } = req.body;
            const updatedSubscription = await this.subscriptionService.toggleSubscription(id, isActive);
            res.status(200).json({
                success: true,
                message: "Subscription status updated successfully",
                data: updatedSubscription
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateSubscription(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
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
        }
        catch (error) {
            next(error);
        }
    }
    async subscribeHospital(req, res, next) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            const search = req.query.search || "";
            const filter = req.query.filter || undefined;
            const result = await this.subscriptionService.subscribeHospital(page, limit, search, filter);
            ApiResponse.success(res, "sucess", result);
        }
        catch (error) {
            next(error);
        }
    }
}
