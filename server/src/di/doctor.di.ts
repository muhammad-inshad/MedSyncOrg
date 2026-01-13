import DoctorController from "../modules/doctor/controller/doctor.controller.ts";
import { DoctorService } from "../modules/doctor/service/doctor.service.ts";
import { DoctorRepository } from "../modules/doctor/repository/doctor.repository.ts";
import { TokenService } from "../services/token.service.ts"; 
export const doctorContainer = () => {
  const doctorRepository = new DoctorRepository();
  const tokenService = new TokenService(); 
  const doctorService = new DoctorService(
    doctorRepository,
    tokenService 
  );

  const doctorcontroller = new DoctorController(doctorService);

  return {
    doctorcontroller,
  };
};
