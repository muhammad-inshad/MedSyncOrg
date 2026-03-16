import express from "express";
import { paymentContainer } from "../di/payment.di.ts";
import { hospitalContainer } from "../di/hospital.di.ts";

const router = express.Router();
const { paymentController } = paymentContainer();
const { hospitalAuthMiddleware } = hospitalContainer();

router.post("/checkout", hospitalAuthMiddleware.handle, paymentController.checkoutPayment.bind(paymentController));

router.post("/webhook", paymentController.handleWebhook.bind(paymentController));

export default router;