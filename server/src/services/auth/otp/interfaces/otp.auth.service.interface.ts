import { SuccessResponseDTO } from "../../../../dto/auth/success-response.dto.js";

export interface IPatientOtpAuthService {
  sendOtp(email: string, purpose: string, role: string): Promise<SuccessResponseDTO>;
  verifyOtp(email: string, userOtp: string): Promise<SuccessResponseDTO>;
}