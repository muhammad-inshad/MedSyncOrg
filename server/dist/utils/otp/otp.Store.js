const globalOtpStore = globalThis;
if (!globalOtpStore.otpStore) {
    globalOtpStore.otpStore = new Map();
}
export const otpStore = globalOtpStore.otpStore;
