
export type OtpData = {
  otp: string;
  expiresAt: number;
};
const globalOtpStore = globalThis as unknown as { otpStore: Map<string, OtpData> };
if (!globalOtpStore.otpStore) {
  globalOtpStore.otpStore = new Map();
}

export const otpStore = globalOtpStore.otpStore;