import { AuthService } from "../services/auth.service.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import OtpController from "../controllers/otp.controller.ts";
import AuthController from "../controllers/auth.controller.ts";
import { TokenService } from '../services/token.service.ts';

 export const userContainer=()=>{
const userRepository = new UserRepository();
const tokenService = new TokenService();                  
const authService = new AuthService(userRepository, tokenService);
const otpController=new OtpController();
const authController=new AuthController(authService);
 return {
    userRepository,
    authService,
    otpController,
    authController,
    tokenService
 }
}

