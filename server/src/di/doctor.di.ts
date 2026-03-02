import { DoctorAuthController } from "../controllers/auth/doctor/doctor.auth.controller.ts";
import { DoctorAuthService } from "../services/auth/doctor/doctor.auth.service.ts";
import DoctorController from "../controllers/doctor/doctor.controller.ts";
import { DoctorService } from "../services/doctor/doctor.service.ts";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.ts";
import { TokenService } from "../services/token/token.service.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { DoctorMapper } from "../mappers/doctor.mapper.ts";
import { DoctorAuthMiddleware } from "../middleware/doctor.auth.middleware.ts";

export const doctorContainer = () => {
  const doctorRepository = new DoctorRepository(DoctorModel);
  const tokenService = new TokenService();

  const doctorService = new DoctorService(
    doctorRepository,
    tokenService
  );

  const doctorMapper = new DoctorMapper();
  const doctorAuthService = new DoctorAuthService(
    doctorRepository,
    tokenService,
    doctorMapper
  );

  const doctorcontroller = new DoctorController(doctorService);
  const doctorAuthController = new DoctorAuthController(doctorAuthService);
  const doctorAuthMiddleware = new DoctorAuthMiddleware(tokenService, doctorRepository);

  return {
    tokenService,
    doctorcontroller,
    doctorAuthController,
    doctorRepository,
    doctorAuthMiddleware
  };
};
