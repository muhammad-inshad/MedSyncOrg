export interface IOtpRepository {
  saveOtp(email: string, otp: string): Promise<void>;
  getOtpByEmail(email: string): Promise<{ otp: string } | null>;
  deleteOtpByEmail(email: string): Promise<void>;
}