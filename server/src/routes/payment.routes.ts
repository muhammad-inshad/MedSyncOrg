import express from "express";
import { paymentContainer } from "../di/payment.di.js";
import { hospitalContainer } from "../di/hospital.di.js";
import { patientContainer } from "../di/patient.di.js";

const router = express.Router();
const { paymentController } = paymentContainer();
const { hospitalAuthMiddleware } = hospitalContainer();
const { patientAuthMiddleware } = patientContainer();

router.post("/checkout", hospitalAuthMiddleware.handle, paymentController.checkoutPayment.bind(paymentController));

router.post("/appointment-checkout", patientAuthMiddleware.handle, paymentController.appointmentCheckout.bind(paymentController));

router.post("/subscription/upgrade", hospitalAuthMiddleware.handle, paymentController.upgradeSubscription.bind(paymentController));

router.post("/webhook", paymentController.handleWebhook.bind(paymentController));

export default router;