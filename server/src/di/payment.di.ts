import { HospitalRepository } from "../repositories/hospital/hospital.repository.js";
import { HospitalModel } from "../models/hospital.model.js";
import { SubscriptionRepository } from "../repositories/superAdmin/subscription/implements/subscription.repository.js";
import { PaymentService } from "../services/payment/implementation/payment.service.js";
import { PaymentController } from "../controllers/payment/implementation/payment.controller.js";
import { PaymentMapper } from "../mappers/payment.mapper.js";
import { TokenService } from "../services/token/token.service.js";
import { patientContainer } from "./patient.di.js";
import { WalletRepository } from "../repositories/wallet/wallet.repository.js";
import { Wallet } from "../models/wallet.model.js";

export const paymentContainer = () => {
    const hospitalRepo = new HospitalRepository(HospitalModel);
    const subscriptionRepo = new SubscriptionRepository();
    const token=new TokenService()
    const { patientService } = patientContainer();
    const paymentMapper = new PaymentMapper();
    const WalletRepo = new WalletRepository(Wallet);
    const paymentService = new PaymentService(subscriptionRepo, hospitalRepo, patientService, paymentMapper, WalletRepo);
    const paymentController = new PaymentController(paymentService,token);

    return {
        paymentController,
        paymentService
    };
};
