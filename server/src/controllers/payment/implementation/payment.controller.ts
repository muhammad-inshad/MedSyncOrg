import { Request, Response } from "express";
import { IPaymentController } from "../interfaces/payment.controller.interface.ts";
import { IPaymentService } from "../../../services/payment/interfaces/payment.service.interface.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../constants/enums.ts";
import { AppError } from "../../../errors/app.error.ts";
import { ITokenService } from "../../../services/token/token.service.interface.ts";
import logger from "../../../utils/logger.ts";


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

            console.log("Initiating checkout with planId:", planId, "and hospitalId:", hospitalId);
            const result = await this.paymentService.createCheckoutSession(planId, hospitalId);
            console.log("Created Stripe Checkout Session:", result);
            res.status(HttpStatusCode.OK).json({
                success: true,
                url: result.url,
            });
        } catch (error: unknown) {
            logger.error("Checkout session creation failed:", error);
            const statusCode = error instanceof AppError ? error.statusCode : HttpStatusCode.INTERNAL_SERVER_ERROR;
            const message = error instanceof Error ? error.message : "Payment failed";
            res.status(statusCode).json({
                success: false,
                message,
            });
        }
    }

    async appointmentCheckout(req: Request, res: Response): Promise<void> {
        try {
            const { bookingData } = req.body;
            const { accessToken } = req.cookies;

            const decoded = this._token.verifyAccessToken(accessToken);
            const patientId = decoded.userId;

            if (!bookingData) {
                ApiResponse.error(res, "Booking data is required", null, HttpStatusCode.BAD_REQUEST);
                return;
            }

            const result = await this.paymentService.createAppointmentCheckoutSession(bookingData, patientId);
            res.status(HttpStatusCode.OK).json({
                success: true,
                url: result.url,
            });
        } catch (error: unknown) {
            logger.error("Appointment checkout failed:", error);
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
            logger.info(`[PaymentController.handleWebhook] Received webhook with signature: ${sig}`);
            await this.paymentService.handleWebhook(sig, req.body);
            res.status(HttpStatusCode.OK).json({ received: true });
        } catch (error: unknown) {
            const statusCode = error instanceof AppError ? error.statusCode : HttpStatusCode.BAD_REQUEST;
            const message = error instanceof Error ? error.message : "Unknown error";
            res.status(statusCode).send(`Webhook Error: ${message}`);
        }
    }
}

