import { PatientAuthService } from "../services/auth/patient/implementations/patient.auth.service.ts";
import { UserRepository } from "../repositories/patient/user.repository.ts";
import OtpController from "../controllers/auth/otp/otp.controller.ts";
import PatientAuthController from "../controllers/auth/patient/implementations/patient.auth.controller.ts";
import { TokenService } from '../services/token.service.ts';
import { Patient } from '../models/Patient.model.ts'
import { OtpService } from "../services/auth/otp/implementations/otp.service.ts";
import { EmailService } from "../services/auth/otp/implementations/email.service.ts";
import { AdminRepository } from "../repositories/admin/admin.repository.ts";
import { DoctorRepository } from "../repositories/doctor.repository.ts";
import { AdminModel } from "../models/admin.model.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { GoogleAuthController } from "../controllers/auth/patient/implementations/googleAuth.controller.ts";
import { OtpRepository } from "../repositories/otp/otp.repository.ts";

export const userContainer = () => {
  const tokenService = new TokenService();
  const emailService = new EmailService();

  const userRepository = new UserRepository(Patient);

  const doctorRepo = new DoctorRepository(DoctorModel);
  const adminRepo = new AdminRepository(AdminModel);
  const otpRepository = new OtpRepository();

  const otpservice = new OtpService(
    userRepository,
    otpRepository,
    emailService,
    adminRepo,
    doctorRepo
  );
  const authService = new PatientAuthService(userRepository, tokenService, adminRepo, doctorRepo);

  const otpController = new OtpController(otpservice);
  const authController = new PatientAuthController(authService);
  const googleAuthController = new GoogleAuthController(tokenService);
  return {
    userRepository,
    authService,
    otpController,
    authController,
    tokenService,
    googleAuthController
  };
};