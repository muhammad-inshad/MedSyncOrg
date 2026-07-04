import { SuccessResponseDTO } from "../../../../dto/auth/success-response.dto.ts";
import { OtpResponseDTO } from "../../../../dto/auth/otp-response.dto.ts";

export type OtpData = {
  otp: string;
  expiresAt: number;
};

export interface IOtpStore {
  setOtp(email: string, data: OtpData): Promise<SuccessResponseDTO>;
  getOtp(email: string): Promise<OtpResponseDTO | null>;
  deleteOtp(email: string): Promise<SuccessResponseDTO>;
}