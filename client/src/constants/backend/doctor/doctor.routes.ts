export const DOCTOR_MANAGEMENT = {
    LOGIN: "/api/auth/doctor/login",
    REGISTER: "/api/auth/doctor/register",
    GET_ME: "/api/doctor/me",
    EDIT_PROFILE: () => `/api/doctor/profile`,
    REAPPLY: (id: string) => `/api/doctor/reapply/${id}`,
    UPCOMING_APPOINTMENTS:`/api/doctor/appointments/upcoming`,
    DOCTOR_APPLAY_LEAVE: "/api/doctor/leaves",
    GET_LEAVES: "/api/doctor/leaves",
    GET_APPOIMENTS:"/api/doctor/consultation",
    SAVE_PRISCRIPTION:"/api/doctor/prescription"
};
