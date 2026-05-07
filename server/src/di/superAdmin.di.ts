import { SuperAdminHospitalController } from "../controllers/superAdmin/hospital/implementation/hospital.controller.ts";
import { SuperAdminHospitalService } from "../services/superAdmin/hospital/implementation/hospital.service.ts";
import { SuperAdminDashboardController } from "../controllers/superAdmin/dashboard/implementation/dashboard.controller.ts";
import { SuperAdminDashboardService } from "../services/superAdmin/dashboard/implementation/dashboard.service.ts";
import { SuperAdminKycController } from "../controllers/superAdmin/kycManagement/implementation/kyc.controller.ts";
import { SuperAdminKycService } from "../services/superAdmin/kycManagement/implementation/kyc.service.ts";
import { SuperAdminPatientManagementService } from "../services/superAdmin/patient/implementations/patient.management.service.ts";
import { SuperAdminPatientManagementController } from "../controllers/superAdmin/patient/implementation/patient.management.controller.ts";
import { TokenService } from "../services/token/token.service.ts";
import { SubscriptionRepository } from "../repositories/superAdmin/subscription/implements/subscription.repository.ts";
import { SubscriptionService } from "../services/superAdmin/subscription/implementation/subscription.service.ts";
import { SubscriptionController } from "../controllers/superAdmin/subscription/implementation/subscription.controller.ts";

import { SuperAdminModel } from "../models/superAdmin.model.ts";
import { KycRepository } from "../repositories/superAdmin/implements/superAdminKyc.repository.ts";
import { SuperAdminAuthService } from "../services/auth/superAdmin/superAdmin.service.ts";
import { SuperAdminAuthController } from "../controllers/auth/superAdmin/superAdmin.auth.controller.ts";
import { SuperAdminMapper } from "../mappers/superAdmin.mapper.ts";
import { HospitalMapper } from "../mappers/hospital.mapper.ts";
import { KycHospitalMapper } from "../mappers/kyc-hospital.mapper.ts";
import { SubscriptionMapper } from "../mappers/subscription.mapper.ts";
import { HospitalModel } from "../models/hospital.model.ts";
import { HospitalRepository } from "../repositories/hospital/hospital.repository.ts";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { UserRepository } from "../repositories/patient/user.repository.ts";
import { Patient } from "../models/Patient.model.ts";
import { PatientMapper } from "../mappers/patient.mapper.ts";
import { SuperAdminRepository } from "../repositories/superAdmin/implements/superAdmin.repository.ts";
import { WalletRepository } from "../repositories/wallet/wallet.repository.ts";
import { Wallet } from "../models/wallet.model.ts";


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
  const dashboardService = new SuperAdminDashboardService(superAdminRepo, kycRepo, doctorRepo, patientRepo,WalletRepo);
  const dashboardController = new SuperAdminDashboardController(dashboardService);

  // Hospital Management Module
  const hospitalService = new SuperAdminHospitalService(kycRepo, hospitalRepo, hospitalMapper, subscriptionRepo);
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
  const subscriptionService = new SubscriptionService(subscriptionRepo, subscriptionMapper,hospitalMapper);
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
