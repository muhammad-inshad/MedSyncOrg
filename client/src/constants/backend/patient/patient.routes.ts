export const PATIENT_MANAGEMENT = {
    GET_ME: "/api/patient/getme",
    UPDATE_PROFILE: "/api/patient/profileUpdate",
    GET_ALL_PATIENT: "/api/patient/getAllPatient",
    EDIT_PROFILE: (id: string) => `/api/patient/patientEdit/${id}`,
    GET_SELECTED_HOSPITAL: (id: string) => `/api/patient/selected_hospital/${id}`,
    GET_DEPARTMENTS: "/api/patient/getdepartments",
    GET_DOCTOR_DEPARTMENT: (id: string) => `/api/patient/get-department-doctors/${id}`,
    GET_DOCTOR_DETAILS: (id: string) => `/api/patient/doctor-details/${id}`,
    GET_AVAILABLE_SLOTS: (doctorId: string) => `/api/patient/available-slots/${doctorId}`,
    BOOK_APPOINTMENT: "/api/patient/book-appointment"
};
