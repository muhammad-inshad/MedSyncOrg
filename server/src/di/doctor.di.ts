import DoctorController from "../controllers/doctor.controller.ts";
import { DoctorService } from "../services/doctor.service.ts";
import { DoctorRepository } from "../repositories/doctor.repository.ts";
import { TokenService } from "../services/token.service.ts";
import { DoctorModel } from "../models/doctor.model.ts";

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
