export const MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: "Login successful",
        LOGIN_FAILED: "Invalid email or password",
        SIGNUP_SUCCESS: "Registration successful",
        ALREADY_EXISTS: "User already exists",
        OTP_SENT: "OTP sent successfully",
        OTP_VERIFIED: "OTP verified successfully",
        UNAUTHORIZED: "Authentication required. Please log in.",
        SESSION_EXPIRED: "Session expired or invalid token",
        FORBIDDEN: "You do not have permission to perform this action",
        ACCOUNT_BLOCKED: "Your account has been deactivated. Contact support.",
    },
    DOCTOR: {
        REGISTER_SUCCESS: "Doctor registered successfully",
        NOT_FOUND: "Doctor not found",
        UPDATE_SUCCESS: "Doctor updated successfully",
        FETCH_SUCCESS: "Doctor fetched successfully",
        VERIFIED: "Doctor account verified successfully",
        REJECTED: "Doctor application rejected",
    },
    ADMIN: {
        HOSPITAL_EXISTS: "Admin/Hospital already exists",
        FETCH_SUCCESS: "Admin profile fetched successfully",
        UPDATE_SUCCESS: "Hospital updated successfully",
        STATUS_CHANGED: (isActive: boolean) => `Hospital successfully ${isActive ? 'activated' : 'deactivated'}`,
    },
    PATIENT: {
        FETCH_SUCCESS: "Patient profile fetched successfully",
        UPDATE_SUCCESS: "Patient updated successfully",
    },
    SERVER: {
        ERROR: "An unexpected error occurred",
        NOT_FOUND: "Resource not found",
    }
};
