import { AdminController } from "../controllers/admin.controller.ts";
import { AdminService } from "../services/admin.service.ts";
import { AdminRepository } from "../repositories/admin.repository.ts";
import { TokenService } from "../services/token.service.ts";
import { AdminModel } from "../models/admin.model.ts";
import { DoctorManagementController } from "../controllers/DoctorManagement.Controller.ts";
import { DoctorManagementService } from "../services/doctorManagement.service.ts";
import { DoctorRepository } from "../repositories/doctor.repository.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { PatientManagementController } from "../controllers/patientManagement.controller.ts";
import { patientManagementService } from "../services/patientManagement.service.ts"
import { UserRepository } from "../repositories/user.repository.ts";
import { Patient } from "../models/Patient.model.ts";

export const adminContainer = () => {
  const adminRepository = new AdminRepository(AdminModel);
  const userRepository = new UserRepository(Patient)
  const tokenService = new TokenService();
  const doctorRepository = new DoctorRepository(DoctorModel);
  const adminService = new AdminService(
    adminRepository,
    tokenService
  );

  const doctorManagementService = new DoctorManagementService(
    adminRepository,
    tokenService,
    doctorRepository
  );

  const adminController = new AdminController(adminService);

  const doctorManagement = new DoctorManagementController(
    doctorManagementService
  );
  const patientService = new patientManagementService(
    adminRepository, userRepository
  )
  const patientManagement = new PatientManagementController(
    patientService
  );

  return {
    adminController,
    doctorManagement,
    adminService,
    doctorManagementService,
    adminRepository,
    patientManagement,
    patientService
  };
};
