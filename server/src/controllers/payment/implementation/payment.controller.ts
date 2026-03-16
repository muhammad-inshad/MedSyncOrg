import { Request, Response } from "express";
import { IPaymentController } from "../interfaces/payment.controller.interface.ts";
import { IPaymentService } from "../../../services/payment/interfaces/payment.service.interface.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../constants/enums.ts";
import { AppError } from "../../../errors/app.error.ts";
import { ITokenService } from "../../../services/token/token.service.interface.ts";

export class PaymentController implements IPaymentController {
    constructor(private readonly paymentService: IPaymentService,private readonly _token:ITokenService) {}

    async checkoutPayment(req: Request, res: Response): Promise<void> {
        try {
            const { planId } = req.body;
        const { accessToken } = req.cookies;

const decoded = this._token.verifyAccessToken(accessToken);

const hospitalId = decoded.userId;


            if (!planId) {
                ApiResponse.error(res, "Plan ID is required", null, HttpStatusCode.BAD_REQUEST);
                return;
            }

            const result = await this.paymentService.createCheckoutSession(planId, hospitalId);
            res.status(HttpStatusCode.OK).json({
                success: true,
                url: result.url,
            });
        } catch (error: unknown) {
            const statusCode = error instanceof AppError ? error.statusCode : HttpStatusCode.INTERNAL_SERVER_ERROR;
            const message = error instanceof Error ? error.message : "Payment failed";
            res.status(statusCode).json({
                success: false,
                message,
            });
        }
    }

    async handleWebhook(req: Request, res: Response): Promise<void> {
        try {
            const sig = req.headers["stripe-signature"] as string;
            await this.paymentService.handleWebhook(sig, req.body);
            res.status(HttpStatusCode.OK).json({ received: true });
        } catch (error: unknown) {
            const statusCode = error instanceof AppError ? error.statusCode : HttpStatusCode.BAD_REQUEST;
            const message = error instanceof Error ? error.message : "Unknown error";
            res.status(statusCode).send(`Webhook Error: ${message}`);
        }
    }
}
