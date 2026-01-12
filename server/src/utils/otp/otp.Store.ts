type OtpData = {
  otp: string;
  expiresAt: number;
};

export const otpStore = new Map<string, OtpData>();
