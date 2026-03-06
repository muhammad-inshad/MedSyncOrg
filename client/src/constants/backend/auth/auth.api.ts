import api from "@/lib/api";
import { AUTH_MANAGEMENT } from "./auth.routes";
import type { LoginData, ResetPasswordData, VerifyOtpData, SendOtpData, SignupData } from "@/interfaces/api.interfaces";

export const authApi = {
    sendOtp: (data: SendOtpData) =>
        api.post(AUTH_MANAGEMENT.SEND_OTP, data),

    verifyOtp: (data: VerifyOtpData) =>
        api.post(AUTH_MANAGEMENT.VERIFY_OTP, data),

    signup: (data: SignupData) =>
        api.post(AUTH_MANAGEMENT.SIGNUP, data),

    hospitalSignup: (data: FormData) =>
        api.post(AUTH_MANAGEMENT.HOSPITAL_SIGNUP, data),

    login: (data: LoginData) => {
        let url = AUTH_MANAGEMENT.LOGIN;
        if (data.role?.toLowerCase() === 'doctor') url = AUTH_MANAGEMENT.DOCTOR_LOGIN;
        if (data.role?.toLowerCase() === 'hospital') url = AUTH_MANAGEMENT.HOSPITAL_LOGIN;
        if (data.role?.toLowerCase() === 'superadmin') url = AUTH_MANAGEMENT.SUPERADMIN_LOGIN;
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

    getHospitals: (page: number, limit: number, search: string) =>
        api.get(AUTH_MANAGEMENT.SELECTHOSPITLADOCTOR, {
            params: {
                page,
                limit,
                search
            }
        }),

    RegistorDoctor: (data: FormData) => {
        return api.post(AUTH_MANAGEMENT.REGISTORDOCTOR, data);
    },
    getHospitalDepartments: (hospitalId: string) =>
        api.get(AUTH_MANAGEMENT.GET_HOSPITAL_DEPARTMENTS(hospitalId)),

    getHospitalQualifications: (hospitalId: string) =>
        api.get(AUTH_MANAGEMENT.GET_HOSPITAL_QUALIFICATIONS(hospitalId)),

    getHospitalSpecializations: (hospitalId: string, departmentId?: string) =>
        api.get(AUTH_MANAGEMENT.GET_HOSPITAL_SPECIALIZATIONS(hospitalId), {
            params: { departmentId }
        }),

};
