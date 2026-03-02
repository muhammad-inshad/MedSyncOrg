export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    [key: string]: string | number | boolean | undefined;
}

export interface LoginData {
    email: string;
    password: string;
    role?: string;
}

export interface VerifyOtpData {
    email?: string;
    otp: string;
    role?: string;
    signupData?: Record<string, unknown>;
}

export interface ResetPasswordData {
    email: string;
    otp: string;
    newPassword?: string;
    password?: string;
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
