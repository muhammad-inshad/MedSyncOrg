export const PATIENT_MANAGEMENT = {
    GET_ME: "/api/patient/getme",
    UPDATE_PROFILE: "/api/patient/profileUpdate",
    GET_ALL_PATIENT: "/api/patient/getAllPatient",
    EDIT_PROFILE: (id: string) => `/api/patient/patientEdit/${id}`,
    GET_SELECTED_HOSPITAL:(id:string)=>`/api/patient/selected_hospital/${id}`
};
