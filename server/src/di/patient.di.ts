import { UserRepository } from "../repositories/user.repository.ts";
import PatientController from "../controllers/Patient.controller.ts";

export const patientContainer = () => {
  const userRepository = new UserRepository();
  const patientController = new PatientController(userRepository);

  return {
    patientController,
  };
};
