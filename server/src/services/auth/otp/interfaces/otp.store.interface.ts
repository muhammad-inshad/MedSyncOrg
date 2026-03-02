export type OtpData = {
  otp: string;
  expiresAt: number;
};

export interface IOtpStore {
  setOtp(email: string, data: OtpData): void | Promise<void>;
  getOtp(email: string): OtpData | undefined | Promise<OtpData | undefined>;
  deleteOtp(email: string): void | Promise<void>;
}