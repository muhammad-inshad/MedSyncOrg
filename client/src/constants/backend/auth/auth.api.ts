import api from "@/lib/api";
import { AUTH_MANAGEMENT } from "./auth.routes";
import type { LoginData, ResetPasswordData, VerifyOtpData } from "@/interfaces/api.interfaces";

export const authApi = {
    sendOtp: (data: { email: string; role?: 'patient' | 'doctor' | 'hospital' | 'superadmin'; purpose?: string }) =>
        api.post(AUTH_MANAGEMENT.SEND_OTP, data),

    verifyOtp: (data: VerifyOtpData) =>
        api.post(AUTH_MANAGEMENT.VERIFY_OTP, data),

    signup: (data: FormData) =>
        api.post(AUTH_MANAGEMENT.SIGNUP, data),

    login: (data: LoginData) => {
        let url = AUTH_MANAGEMENT.LOGIN;
        if (data.role === 'doctor') url = AUTH_MANAGEMENT.DOCTOR_LOGIN;
        if (data.role === 'hospital') url = AUTH_MANAGEMENT.HOSPITAL_LOGIN;
        if (data.role === 'Superadmin') url = AUTH_MANAGEMENT.SUPERADMIN_LOGIN;
        return api.post(url, data);
    },

    refresh: () =>
        api.post(AUTH_MANAGEMENT.REFRESH),

    resetPassword: (data: ResetPasswordData) =>
        api.post(AUTH_MANAGEMENT.RESET_PASSWORD, data),

    logout: () =>
        api.post(AUTH_MANAGEMENT.LOGOUT),

    googleLogin: () =>
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
};
