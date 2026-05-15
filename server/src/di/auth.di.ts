import { PatientAuthService } from "../services/auth/patient/implementations/patient.auth.service.js";
import { UserRepository } from "../repositories/patient/user.repository.js";
import OtpController from "../controllers/auth/otp/otp.controller.js";
import PatientAuthController from "../controllers/auth/patient/implementations/patient.auth.controller.js";
import { TokenService } from '../services/token/token.service.js';

import { OtpService } from "../services/auth/otp/implementations/otp.service.js";
import { EmailService } from "../services/auth/otp/implementations/email.service.js";
import { HospitalRepository } from "../repositories/hospital/hospital.repository.js";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.js";
import { HospitalModel } from "../models/hospital.model.js";
import { DoctorModel } from "../models/doctor.model.js";
import { GoogleAuthController } from "../controllers/auth/patient/implementations/googleAuth.controller.js";
import { OtpRepository } from "../repositories/otp/otp.repository.js";
import { PatientMapper } from "../mappers/patient.mapper.js";
import { Patient } from "../models/Patient.model.js";

export const userContainer = () => {
  const tokenService = new TokenService();
  const emailService = new EmailService();

  const userRepository = new UserRepository(Patient);

  const doctorRepo = new DoctorRepository(DoctorModel);
  const hospitalRepo = new HospitalRepository(HospitalModel);
  const otpRepository = new OtpRepository();

  const otpservice = new OtpService(
    userRepository,
    otpRepository,
    emailService,
    hospitalRepo,
    doctorRepo
  );
  
  const patientMapper = new PatientMapper();
  const authService = new PatientAuthService(userRepository, tokenService, hospitalRepo, doctorRepo, patientMapper);

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