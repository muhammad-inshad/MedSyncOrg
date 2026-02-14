export const DOCTOR_MANAGEMENT = {
    LOGIN: "/api/auth/doctor/login",
    REGISTER: "/api/auth/RegistorDoctor",
    GET_ME: "/api/doctor/getme",
    EDIT_PROFILE: (id: string) => `/api/doctor/doctorEdit/${id}`,
};
