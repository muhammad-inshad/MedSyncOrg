import { SuperAdminHospitalController } from "../controllers/superAdmin/hospital/implementation/hospital.controller.js";
import { SuperAdminHospitalService } from "../services/superAdmin/hospital/implementation/hospital.service.js";
import { SuperAdminDashboardController } from "../controllers/superAdmin/dashboard/implementation/dashboard.controller.js";
import { SuperAdminDashboardService } from "../services/superAdmin/dashboard/implementation/dashboard.service.js";
import { SuperAdminKycController } from "../controllers/superAdmin/kycManagement/implementation/kyc.controller.js";
import { SuperAdminKycService } from "../services/superAdmin/kycManagement/implementation/kyc.service.js";
import { SuperAdminPatientManagementService } from "../services/superAdmin/patient/implementations/patient.management.service.js";
import { SuperAdminPatientManagementController } from "../controllers/superAdmin/patient/implementation/patient.management.controller.js";
import { TokenService } from "../services/token/token.service.js";
import { SubscriptionRepository } from "../repositories/superAdmin/subscription/implements/subscription.repository.js";
import { SubscriptionService } from "../services/superAdmin/subscription/implementation/subscription.service.js";
import { SubscriptionController } from "../controllers/superAdmin/subscription/implementation/subscription.controller.js";
import { SuperAdminModel } from "../models/superAdmin.model.js";
import { KycRepository } from "../repositories/superAdmin/implements/superAdminKyc.repository.js";
import { SuperAdminAuthService } from "../services/auth/superAdmin/superAdmin.service.js";
import { SuperAdminAuthController } from "../controllers/auth/superAdmin/superAdmin.auth.controller.js";
import { SuperAdminMapper } from "../mappers/superAdmin.mapper.js";
import { HospitalMapper } from "../mappers/hospital.mapper.js";
import { KycHospitalMapper } from "../mappers/kyc-hospital.mapper.js";
import { SubscriptionMapper } from "../mappers/subscription.mapper.js";
import { HospitalModel } from "../models/hospital.model.js";
import { HospitalRepository } from "../repositories/hospital/hospital.repository.js";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.js";
import { DoctorModel } from "../models/doctor.model.js";
import { UserRepository } from "../repositories/patient/user.repository.js";
import { Patient } from "../models/Patient.model.js";
import { PatientMapper } from "../mappers/patient.mapper.js";
import { SuperAdminRepository } from "../repositories/superAdmin/implements/superAdmin.repository.js";
import { WalletRepository } from "../repositories/wallet/wallet.repository.js";
import { Wallet } from "../models/wallet.model.js";
export const superAdminContainer = () => {
    const superAdminRepo = new SuperAdminRepository(SuperAdminModel);
    const tokenService = new TokenService();
    const kycRepo = new KycRepository(HospitalModel);
    const hospitalRepo = new HospitalRepository(HospitalModel);
    const subscriptionRepo = new SubscriptionRepository();
    const doctorRepo = new DoctorRepository(DoctorModel);
    const patientRepo = new UserRepository(Patient);
    const hospitalMapper = new HospitalMapper();
    const kycHospitalMapper = new KycHospitalMapper();
    const subscriptionMapper = new SubscriptionMapper();
    const WalletRepo = new WalletRepository(Wallet);
    // Dashboard Module
    const dashboardService = new SuperAdminDashboardService(superAdminRepo, kycRepo, doctorRepo, patientRepo, WalletRepo);
    const dashboardController = new SuperAdminDashboardController(dashboardService);
    // Hospital Management Module
    const hospitalService = new SuperAdminHospitalService(kycRepo, hospitalRepo, hospitalMapper, subscriptionRepo, doctorRepo);
    const hospitalController = new SuperAdminHospitalController(hospitalService);
    // KYC Management Module
    const kycService = new SuperAdminKycService(kycRepo, kycHospitalMapper);
    const kycController = new SuperAdminKycController(kycService);
    // Auth Module
    const superAdminMapper = new SuperAdminMapper();
    const superAdminAuthService = new SuperAdminAuthService(superAdminRepo, tokenService, superAdminMapper);
    const superAdminAuthController = new SuperAdminAuthController(superAdminAuthService);
    // Patient Management Module
    const patientMapper = new PatientMapper();
    const patientManagementService = new SuperAdminPatientManagementService(patientRepo, patientMapper);
    const patientManagementController = new SuperAdminPatientManagementController(patientManagementService);
    // Subscription Module
    const subscriptionService = new SubscriptionService(subscriptionRepo, subscriptionMapper, hospitalMapper);
    const subscriptionController = new SubscriptionController(subscriptionService);
    return {
        tokenService,
        dashboardController,
        hospitalController,
        kycController,
        superAdminAuthController,
        patientManagementController,
        subscriptionController
    };
};
