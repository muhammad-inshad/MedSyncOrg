import { SuccessResponseDTO } from "../../../../dto/auth/success-response.dto.ts";

export interface IEmailService {
  sendOtpEmail(to: string, otp: string): Promise<SuccessResponseDTO>;
}