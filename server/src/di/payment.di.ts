import { HospitalRepository } from "../repositories/hospital/hospital.repository.ts";
import { HospitalModel } from "../models/hospital.model.ts";
import { SubscriptionRepository } from "../repositories/superAdmin/subscription/implements/subscription.repository.ts";
import { PaymentService } from "../services/payment/implementation/payment.service.ts";
import { PaymentController } from "../controllers/payment/implementation/payment.controller.ts";
import { TokenService } from "../services/token/token.service.ts";
import { patientContainer } from "./patient.di.ts";

export const paymentContainer = () => {
    const hospitalRepo = new HospitalRepository(HospitalModel);
    const subscriptionRepo = new SubscriptionRepository();
    const token=new TokenService()
    const { patientService } = patientContainer();
    const paymentService = new PaymentService(subscriptionRepo, hospitalRepo, patientService);
    const paymentController = new PaymentController(paymentService,token);

    return {
        paymentController,
        paymentService
    };
};
