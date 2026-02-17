import { UserRepository } from "../repositories/user.repository.ts";
import PatientController from "../controllers/Patient.controller.ts";
import { Patient } from "../models/Patient.model.ts";
import { PatientService } from "../services/patient.service.ts";
export const patientContainer = () => {
    const userRepository = new UserRepository(Patient);
    const patientService = new PatientService(userRepository);
    const patientController = new PatientController(patientService);
    return {
        patientController,
        patientService
    };
};
