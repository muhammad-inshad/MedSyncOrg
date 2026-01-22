import DoctorController from "../modules/doctor/controller/doctor.controller.ts";
import { DoctorService } from "../modules/doctor/service/doctor.service.ts";
import { DoctorRepository } from "../modules/doctor/repository/doctor.repository.ts";
import { TokenService } from "../modules/auth/services/token.service.ts"; 
import { DoctorModel } from "../model/doctor.model.ts";

export const doctorContainer = () => {
  const doctorRepository = new DoctorRepository(DoctorModel);
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
