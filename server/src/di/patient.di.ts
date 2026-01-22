import { UserRepository } from "../modules/auth/repositories/user.repository.ts";
import PatientController from "../modules/patient/controller/Patient.controller.ts";
import { Patient } from "../model/Patient.model.ts";
import { PatientService } from "../modules/patient/service/Patient.service.ts";

export const patientContainer = () => {
  const userRepository = new UserRepository(Patient); 
  const patientService = new PatientService(userRepository);
  const patientController = new PatientController(patientService);
  return {
    patientController,
    patientService
  };
};