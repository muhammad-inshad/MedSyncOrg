
export interface IPatientOtpAuthService {
    sendOtp(email: string, purpose: string, role: string): Promise<void>;
    verifyOtp(email: string, otp: string): Promise<void>;
}