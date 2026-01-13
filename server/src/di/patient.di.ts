import { UserRepository } from "../repositories/user.repository.ts";
import PatientController from "../modules/patient/controller/Patient.controller.ts";

export const patientContainer = () => {
  const userRepository = new UserRepository();
  const patientController = new PatientController(userRepository);

  return {
    patientController,
  };
};
