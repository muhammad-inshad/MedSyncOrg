export const DOCTOR_MANAGEMENT = {
    LOGIN: "/api/auth/doctor/login",
    REGISTER: "/api/auth/RegistorDoctor",
    GET_ME: "/api/doctor/getme",
    EDIT_PROFILE: (id: string) => `/api/doctor/doctorEdit/${id}`,
    REAPPLY: (id: string) => `/api/doctor/reapply/${id}`,
    UPCOMING_APPOINTMENTS: (id: string) => `/api/doctor/upcoming-appointments/${id}`,
    DOCTOR_APPLAY_LEAVE: "/api/doctor/applayleave",
    GET_LEAVES: "/api/doctor/leaves"
};
