import { PatientAuthService } from "../services/auth/patient/patient.auth.service.ts";
import { UserRepository } from "../repositories/patient/user.repository.ts";
import OtpController from "../controllers/otp.controller.ts";
import AuthController from "../controllers/auth.controller.ts";
import { TokenService } from '../services/token.service.ts';
import { Patient } from '../models/Patient.model.ts'
import { OtpService } from "../services/otp.service.ts";
import { EmailService } from "../services/email.service.ts";
import { otpStore } from "../utils/otp/otp.Store.ts";
import { AdminRepository } from "../repositories/admin/admin.repository.ts";
import { DoctorRepository } from "../repositories/doctor.repository.ts";
import { AdminModel } from "../models/admin.model.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { GoogleAuthController } from "../controllers/googleAuth.controller.ts";

export const userContainer = () => {
  const tokenService = new TokenService();
  const emailService = new EmailService();

  const userRepository = new UserRepository(Patient);

  const doctorRepo = new DoctorRepository(DoctorModel);
  const adminRepo = new AdminRepository(AdminModel);

  const otpservice = new OtpService(
    userRepository,
    otpStore,
    emailService,
    adminRepo,
    doctorRepo
  );
  const authService = new PatientAuthService(userRepository, tokenService);

  const otpController = new OtpController(otpservice);
  const authController = new AuthController(authService);
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