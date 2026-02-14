export const ADMIN_MANAGEMENT = {
    LOGIN: "/api/auth/admin/login",
    SIGNUP: "/api/auth/admin/signup",
    GET_ME: "/api/admin/getme",
    EDIT_HOSPITAL: (id: string) => `/api/admin/hospitals/${id}`,
    GET_ALL_DOCTORS: "/api/admin/getalldoctors",
    DOCTORS_TOGGLE: (id: string) => `/api/admin/doctorsToggle/${id}`,
    PATIENTS_TOGGLE: (id: string) => `/api/admin/PatientsToggle/${id}`,
    PATIENT_ADD: "/api/admin/patientAdd",
};
