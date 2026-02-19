import { UserRepository } from "../repositories/patient/user.repository.ts";
import PatientController from "../controllers/Patient.controller.ts";
import { Patient } from "../models/Patient.model.ts";
import { PatientService } from "../services/patient.service.ts";
import { TokenService } from "../services/token.service.ts";
import { AdminRepository } from "../repositories/admin/admin.repository.ts";
import { AdminModel } from "../models/admin.model.ts";

export const patientContainer = () => {
  const tokenService = new TokenService();
  const userRepository = new UserRepository(Patient);
  const adminRepository = new AdminRepository(AdminModel);
  const patientService = new PatientService(userRepository, adminRepository);
  const patientController = new PatientController(patientService);
  return {
    tokenService,
    patientController,
    patientService
  };
};