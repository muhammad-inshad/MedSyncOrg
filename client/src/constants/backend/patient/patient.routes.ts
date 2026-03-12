export const PATIENT_MANAGEMENT = {
    GET_ME: "/api/patient/me",
    UPDATE_PROFILE: "/api/patient/profileUpdate",
    GET_ALL_PATIENT: "/api/patient/patients",
    EDIT_PROFILE: (id: string) => `/api/patient/patients/${id}`,
    GET_SELECTED_HOSPITAL: (id: string) => `/api/patient/hospitals/${id}`,
    GET_DEPARTMENTS: "/api/patient/departments",
    GET_DOCTOR_DEPARTMENT: (id: string) => `/api/patient/departments/${id}/doctors`,
    GET_DOCTOR_DETAILS: (id: string) => `/api/patient/doctors/${id}`,
    GET_AVAILABLE_SLOTS: (doctorId: string) => `/api/patient/doctors/${doctorId}/slots`,
    BOOK_APPOINTMENT: "/api/patient/appointments",
    APPOIMENTHISTORY:(patientID:string)=>`/api/patient/patients/${patientID}/appointments`,
    CANCEL_APPOINTMENT: (id: string) => `/api/patient/appointments/${id}/cancel`,
};
