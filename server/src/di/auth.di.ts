import { AuthService } from "../modules/auth/services/auth.service.ts";
import { UserRepository } from "../modules/auth/repositories/user.repository.ts";
import OtpController from "../modules/auth/controller/otp.controller.ts";
import AuthController from "../modules/auth/controller/auth.controller.ts";
import { TokenService } from '../modules/auth/services/token.service.ts';
import { Patient } from '../model/Patient.model.ts'
import { OtpService } from "../modules/auth/services/otp.service.ts";
import { EmailService } from "../modules/auth/services/email.service.ts"; 
import { otpStore } from "../utils/otp/otp.Store.ts"; 
import { AdminRepository } from "../modules/admin/repositories/admin.repository.ts";
import {DoctorRepository } from "../modules/doctor/repository/doctor.repository.ts";
import { AdminModel } from "../model/admin.model.ts";
import { DoctorModel } from "../model/doctor.model.ts";
import { GoogleAuthController } from "../modules/auth/controller/googleAuth.controller.ts";

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
  const authService = new AuthService(userRepository, tokenService,adminRepo,doctorRepo);

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