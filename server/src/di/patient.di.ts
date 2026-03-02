import { UserRepository } from "../repositories/patient/user.repository.ts";
import PatientController from "../controllers/patient/Patient.controller.ts";
import { Patient } from "../models/Patient.model.ts";
import { PatientService } from "../services/patient/patient.service.ts";
import { TokenService } from "../services/token/token.service.ts";
import { HospitalRepository } from "../repositories/hospital/hospital.repository.ts";
import { HospitalModel } from "../models/hospital.model.ts";
import { PatientAuthMiddleware } from "../middleware/patient.auth.middleware.ts";

export const patientContainer = () => {
  const tokenService = new TokenService();
  const userRepository = new UserRepository(Patient);
  const hospitalRepository = new HospitalRepository(HospitalModel);
  const patientService = new PatientService(userRepository, hospitalRepository);
  const patientController = new PatientController(patientService);
  const patientAuthMiddleware = new PatientAuthMiddleware(tokenService, userRepository);
  return {
    tokenService,
    patientController,
    patientService,
    patientAuthMiddleware
  };
};