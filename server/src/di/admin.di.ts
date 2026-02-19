import { AdminController } from "../controllers/admin.controller.ts";
import { AdminService } from "../services/admin.service.ts";
import { AdminRepository } from "../repositories/admin/admin.repository.ts";
import { TokenService } from "../services/token.service.ts";
import { AdminModel } from "../models/admin.model.ts";
import { DoctorManagementController } from "../controllers/DoctorManagement.Controller.ts";
import { DoctorManagementService } from "../services/doctorManagement.service.ts";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { PatientManagementController } from "../controllers/patientManagement.controller.ts";
import { patientManagementService } from "../services/patientManagement.service.ts"
import { UserRepository } from "../repositories/patient/user.repository.ts";
import { Patient } from "../models/Patient.model.ts";
import { AdminAuthService } from "../services/auth/admin/admin.auth.service.ts";
import { AdminAuthController } from "../controllers/auth/admin/admin.auth.controller.ts";

export const adminContainer = () => {
  const adminRepo = new AdminRepository(AdminModel);
  const patientRepo = new UserRepository(Patient)
  const tokenService = new TokenService();
  const doctorRepo = new DoctorRepository(DoctorModel);

  const adminService = new AdminService(
    adminRepo,
    tokenService,
    doctorRepo,
    patientRepo
  );

  const adminAuthService = new AdminAuthService(
    adminRepo,
    tokenService
  );

  const doctorManagementService = new DoctorManagementService(
    adminRepo,
    tokenService,
    doctorRepo
  );

  const adminController = new AdminController(adminService);
  const adminAuthController = new AdminAuthController(adminAuthService);

  const doctorManagement = new DoctorManagementController(
    doctorManagementService
  );
  const patientService = new patientManagementService(
    adminRepo, patientRepo
  )
  const patientManagement = new PatientManagementController(
    patientService
  );

  return {
    tokenService,
    adminController,
    adminAuthController,
    doctorManagement,
    adminService,
    doctorManagementService,
    adminRepo: adminRepo,
    patientManagement,
    patientService
  };
};
