export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    [key: string]: string | number | boolean | undefined;
}

export type AuthRole = 'patient' | 'doctor' | 'hospital' | 'superadmin' | 'Superadmin';

export interface SendOtpData {
    email: string;
    role?: AuthRole;
    purpose?: string;
}

export interface LoginData {
    email: string;
    password: string;
    role?: AuthRole;
}

export interface VerifyOtpData {
    email?: string;
    otp: string;
    role?: AuthRole;
    signupData?: Record<string, unknown>;
}

export type SignupData = Record<string, unknown> | FormData;

export interface ResetPasswordData {
    email: string;
    otp?: string;
    newPassword?: string;
    password?: string;
    role?: AuthRole;
}

export interface UpdateDoctorKycStatusPayload {
    reason?: string;
}

export interface HospitalStatusUpdateData {
    id: string;
    status: string;
    reason?: string;
}

export interface KycStatusUpdateData {
    id: string;
    status: string;
    reason?: string;
}

export interface SetHospitalActiveData {
    id: string;
    isActive: boolean;
}

export interface ToggleStatusData {
    status: string;
}
