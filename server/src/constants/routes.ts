const API_BASE = "/api";

export const AUTH_ROUTES = {
    SEND_OTP: `${API_BASE}/auth/send-otp`,
    VERIFY_OTP: `${API_BASE}/auth/verify-otp`,
    SIGNUP: `${API_BASE}/auth/signup`,
    LOGIN: `${API_BASE}/auth/auth/login`,
    REFRESH: `${API_BASE}/auth/refresh`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
    LOGOUT: `${API_BASE}/auth/logout`,
    GOOGLE: `${API_BASE}/auth/google`,
    GOOGLE_CALLBACK: `${API_BASE}/auth/google/callback`,
};

export const SUPERADMIN_ROUTES = {
    LOGIN: `${API_BASE}/auth/Superadmin/login`,
    HOSPITAL_MANAGEMENT: `${API_BASE}/superadmin/hospitalManagement`,
    GET_ME: `${API_BASE}/superadmin/getme`,
    SET_ACTIVE: `${API_BASE}/superadmin/setActive`,
    HOSPITALS: `${API_BASE}/superadmin/hospitals`,
    HOSPITAL_STATUS: `${API_BASE}/superadmin/hospitalStatus`,
    REAPPLY: `${API_BASE}/superadmin/reapply`,
};

export const HOSPITAL_ROUTES = {
    LOGIN: `${API_BASE}/auth/hospital/login`,
    SIGNUP: `${API_BASE}/auth/hospital/signup`,
    GET_ME: `${API_BASE}/hospital/getme`,
    EDIT_HOSPITAL: (id: string) => `${API_BASE}/hospital/hospitals/${id}`,
    GET_ALL_DOCTORS: `${API_BASE}/hospital/getalldoctors`,
    DOCTORS_TOGGLE: (id: string) => `${API_BASE}/hospital/doctorsToggle/${id}`,
    PATIENTS_TOGGLE: (id: string) => `${API_BASE}/hospital/PatientsToggle/${id}`,
    PATIENT_ADD: `${API_BASE}/hospital/patientAdd`,
};

// Backward compatibility (optional but safer during the migration)
export const ADMIN_ROUTES = HOSPITAL_ROUTES;

export const DOCTOR_ROUTES = {
    LOGIN: `${API_BASE}/auth/doctor/login`,
    REGISTER: `${API_BASE}/auth/RegistorDoctor`, // Note: Backend routes are a bit messy, mapping as they are
    GET_ME: `${API_BASE}/doctor/getme`,
    EDIT_PROFILE: (id: string) => `${API_BASE}/doctor/doctorEdit/${id}`,
};

export const PATIENT_ROUTES = {
    GET_ME: `${API_BASE}/patient/getme`,
    GET_ALL_PATIENT: `${API_BASE}/patient/getAllPatient`,
    EDIT_PROFILE: (id: string) => `${API_BASE}/patient/patientEdit/${id}`,
};

// As per user request format for PATIENT_MANAGEMENT specifically if needed on frontend
export const PATIENT_MANAGEMENT = {
    GETALLPATIENT: `${API_BASE}/patient/getAllPatient`
};
