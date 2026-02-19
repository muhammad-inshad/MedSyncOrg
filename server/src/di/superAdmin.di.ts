import { SuperAdminController } from "../controllers/superAdmin.controller.ts";
import { SuperAdminService } from "../services/superAdmin.service.ts";
import { SuperAdminRepository } from "../repositories/superAdmin/superAdmin.repository.ts";
import { TokenService } from "../services/token.service.ts";
import { SuperAdminModel } from "../models/superAdmin.model.ts";
import { Superadminkyc } from "../controllers/superAdminkyc.controller.ts";
import { SuperadminkycService } from "../services/superAdminkyc.service.ts";
import { KycRepository } from "../repositories/superAdminKyc.repository.ts";
import { SuperAdminAuthService } from "../services/auth/superAdmin/superAdmin.service.ts";
import { SuperAdminAuthController } from "../controllers/auth/superAdmin/superAdmin.auth.controller.ts";

import { AdminModel } from "../models/admin.model.ts";

import { DoctorRepository } from "../repositories/doctor/doctor.repository.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { UserRepository } from "../repositories/patient/user.repository.ts";
import { Patient } from "../models/Patient.model.ts";

export const superAdminContainer = () => {
  const repo = new SuperAdminRepository(SuperAdminModel);
  const tokenService = new TokenService();


  const kycRepo = new KycRepository(AdminModel);
  const doctorRepo = new DoctorRepository(DoctorModel);
  const patientRepo = new UserRepository(Patient);

  const service = new SuperAdminService(repo, tokenService, kycRepo, doctorRepo, patientRepo);
  const controller = new SuperAdminController(service);

  const kycservice = new SuperadminkycService(kycRepo);
  const kyccontroller = new Superadminkyc(kycservice);

  const superAdminAuthService = new SuperAdminAuthService(repo, tokenService);
  const superAdminAuthController = new SuperAdminAuthController(superAdminAuthService);

  return { tokenService, controller, kyccontroller, superAdminAuthController };
};