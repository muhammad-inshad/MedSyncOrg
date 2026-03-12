export const DOCTOR_MANAGEMENT = {
    LOGIN: "/api/auth/doctor/login",
    REGISTER: "/api/auth/doctor/register",
    GET_ME: "/api/doctor/me",
    EDIT_PROFILE: (id: string) => `/api/doctor/profile/${id}`,
    REAPPLY: (id: string) => `/api/doctor/reapply/${id}`,
    UPCOMING_APPOINTMENTS: (id: string) => `/api/doctor/appointments/upcoming/${id}`,
    DOCTOR_APPLAY_LEAVE: "/api/doctor/leaves",
    GET_LEAVES: "/api/doctor/leaves"
};
