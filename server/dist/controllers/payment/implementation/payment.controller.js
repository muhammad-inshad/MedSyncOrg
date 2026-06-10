import { ApiResponse } from "../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../constants/enums.js";
import { AppError } from "../../../errors/app.error.js";
import logger from "../../../utils/logger.js";
export class PaymentController {
    constructor(paymentService, _token) {
        this.paymentService = paymentService;
        this._token = _token;
    }
    async checkoutPayment(req, res) {
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
        }
        catch (error) {
            logger.error("Checkout session creation failed:", error);
            const statusCode = error instanceof AppError ? error.statusCode : HttpStatusCode.INTERNAL_SERVER_ERROR;
            const message = error instanceof Error ? error.message : "Payment failed";
            res.status(statusCode).json({
                success: false,
                message,
            });
        }
    }
    async appointmentCheckout(req, res) {
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
        }
        catch (error) {
            logger.error("Appointment checkout failed:", error);
            const statusCode = error instanceof AppError ? error.statusCode : HttpStatusCode.INTERNAL_SERVER_ERROR;
            const message = error instanceof Error ? error.message : "Payment failed";
            res.status(statusCode).json({
                success: false,
                message,
            });
        }
    }
    async handleWebhook(req, res) {
        try {
            const sig = req.headers["stripe-signature"];
            logger.info(`[PaymentController.handleWebhook] Received webhook with signature: ${sig}`);
            await this.paymentService.handleWebhook(sig, req.body);
            res.status(HttpStatusCode.OK).json({ received: true });
        }
        catch (error) {
            logger.error(`[PaymentController.handleWebhook] Webhook handling failed:`, error);
            const statusCode = error instanceof AppError ? error.statusCode : HttpStatusCode.BAD_REQUEST;
            const message = error instanceof Error ? error.message : "Unknown error";
            res.status(statusCode).send(`Webhook Error: ${message}`);
        }
    }
}
