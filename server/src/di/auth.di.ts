import { AuthService } from "../modules/auth/services/auth.service.ts";
import { UserRepository } from "../modules/auth/repositories/user.repository.ts";
import OtpController from "../modules/auth/controller/otp.controller.ts";
import AuthController from "../modules/auth/controller/auth.controller.ts";
import { TokenService } from '../modules/auth/services/token.service.ts';
import { Patient } from '../model/Patient.model.ts'
import { OtpService } from "../modules/auth/services/otp.service.ts";
import { EmailService } from "../modules/auth/services/email.service.ts"; 
import { otpStore } from "../utils/otp/otp.Store.ts"; 
export const userContainer = () => {
  const tokenService = new TokenService();
  const emailService = new EmailService();
  const userRepository = new UserRepository(Patient);
  const otpservice = new OtpService(otpStore, emailService);
  const authService = new AuthService(userRepository, tokenService);
  const otpController = new OtpController(otpservice);
  const authController = new AuthController(authService);

  return {
    userRepository,
    authService,
    otpController,
    authController,
    tokenService
  }
}