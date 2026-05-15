import { SuccessResponseDTO } from "../../../../dto/auth/success-response.dto.js";

export interface IEmailService {
  sendOtpEmail(to: string, otp: string): Promise<SuccessResponseDTO>;
}