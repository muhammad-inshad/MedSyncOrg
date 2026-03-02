import { SuperAdminHospitalController } from "../controllers/superAdmin/hospital/implementation/hospital.controller.ts";
import { SuperAdminHospitalService } from "../services/superAdmin/hospital/implementation/hospital.service.ts";
import { SuperAdminDashboardController } from "../controllers/superAdmin/dashboard/implementation/dashboard.controller.ts";
import { SuperAdminDashboardService } from "../services/superAdmin/dashboard/implementation/dashboard.service.ts";
import { SuperAdminKycController } from "../controllers/superAdmin/kycManagement/implementation/kyc.controller.ts";
import { SuperAdminKycService } from "../services/superAdmin/kycManagement/implementation/kyc.service.ts";
<<<<<<< HEAD
import { TokenService } from "../services/token.service.ts";
=======
import { TokenService } from "../services/token/token.service.ts";
>>>>>>> c8a5339 (fix: final removal of secrets and hospital edit logic)
import { SuperAdminModel } from "../models/superAdmin.model.ts";
import { KycRepository } from "../repositories/superAdmin/implements/superAdminKyc.repository.ts";
import { SuperAdminAuthService } from "../services/auth/superAdmin/superAdmin.service.ts";
import { SuperAdminAuthController } from "../controllers/auth/superAdmin/superAdmin.auth.controller.ts";
import { SuperAdminMapper } from "../mappers/superAdmin.mapper.ts";
import { HospitalMapper } from "../mappers/hospital.mapper.ts";
import { HospitalModel } from "../models/hospital.model.ts";
import { HospitalRepository } from "../repositories/hospital/hospital.repository.ts";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { UserRepository } from "../repositories/patient/user.repository.ts";
import { Patient } from "../models/Patient.model.ts";
import { SuperAdminRepository } from "../repositories/superAdmin/implements/superAdmin.repository.ts";

export const superAdminContainer = () => {
  const superAdminRepo = new SuperAdminRepository(SuperAdminModel);
  const tokenService = new TokenService();

  const kycRepo = new KycRepository(HospitalModel);
  const hospitalRepo = new HospitalRepository(HospitalModel);
  const doctorRepo = new DoctorRepository(DoctorModel);
  const patientRepo = new UserRepository(Patient);
  const hospitalMapper = new HospitalMapper();

  // Dashboard Module
  const dashboardService = new SuperAdminDashboardService(superAdminRepo, kycRepo, doctorRepo, patientRepo);
  const dashboardController = new SuperAdminDashboardController(dashboardService);

  // Hospital Management Module
  const hospitalService = new SuperAdminHospitalService(kycRepo, hospitalRepo, hospitalMapper);
  const hospitalController = new SuperAdminHospitalController(hospitalService);

  // KYC Management Module
<<<<<<< HEAD
  const kycService = new SuperAdminKycService(kycRepo,hospitalMapper);
=======
  const kycService = new SuperAdminKycService(kycRepo, hospitalMapper);
>>>>>>> c8a5339 (fix: final removal of secrets and hospital edit logic)
  const kycController = new SuperAdminKycController(kycService);

  // Auth Module
  const superAdminMapper = new SuperAdminMapper();
  const superAdminAuthService = new SuperAdminAuthService(superAdminRepo, tokenService, superAdminMapper);
  const superAdminAuthController = new SuperAdminAuthController(superAdminAuthService);

  return {
    tokenService,
    dashboardController,
    hospitalController,
    kycController,
    superAdminAuthController
  };
};
