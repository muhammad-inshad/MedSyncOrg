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
export const ADMIN_ROUTES = {
    LOGIN: `${API_BASE}/auth/admin/login`,
    SIGNUP: `${API_BASE}/auth/admin/signup`,
    GET_ME: `${API_BASE}/admin/getme`,
    EDIT_HOSPITAL: (id) => `${API_BASE}/admin/hospitals/${id}`,
    GET_ALL_DOCTORS: `${API_BASE}/admin/getalldoctors`,
    DOCTORS_TOGGLE: (id) => `${API_BASE}/admin/doctorsToggle/${id}`,
    PATIENTS_TOGGLE: (id) => `${API_BASE}/admin/PatientsToggle/${id}`,
    PATIENT_ADD: `${API_BASE}/admin/patientAdd`,
};
export const DOCTOR_ROUTES = {
    LOGIN: `${API_BASE}/auth/doctor/login`,
    REGISTER: `${API_BASE}/auth/RegistorDoctor`, // Note: Backend routes are a bit messy, mapping as they are
    GET_ME: `${API_BASE}/doctor/getme`,
    EDIT_PROFILE: (id) => `${API_BASE}/doctor/doctorEdit/${id}`,
};
export const PATIENT_ROUTES = {
    GET_ME: `${API_BASE}/patient/getme`,
    GET_ALL_PATIENT: `${API_BASE}/patient/getAllPatient`,
    EDIT_PROFILE: (id) => `${API_BASE}/patient/patientEdit/${id}`,
};
// As per user request format for PATIENT_MANAGEMENT specifically if needed on frontend
export const PATIENT_MANAGEMENT = {
    GETALLPATIENT: `${API_BASE}/patient/getAllPatient`
};
