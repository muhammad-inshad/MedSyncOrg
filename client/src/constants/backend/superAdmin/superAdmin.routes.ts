export const SUPERADMIN_MANAGEMENT = {
    LOGIN: "/api/auth/Superadmin/login",
    HOSPITAL_MANAGEMENT: "/api/superadmin/hospitalManagement",
    GET_ME: "/api/superadmin/getme",
    SET_ACTIVE: "/api/superadmin/setActive",
    HOSPITALS: "/api/superadmin/hospitals",
    HOSPITAL_STATUS: "/api/superadmin/hospitalStatus",
    REAPPLY: "/api/superadmin/reapply",
    KYC_MANAGEMENT: "/api/superadmin/kyc-management",
    KYC_STATUS: (id: string, status: string) =>
  `/api/superadmin/hospitalStatus/${id}/${status}`,
    ADD_HOSPITAL: "/api/superadmin/add-hospital",
    EDIT_HOSPITAL: (id: string) => `/api/superadmin/hospitals/${id}`,
    DELETE_HOSPITAL: (id: string) => `/api/superadmin/hospitals/${id}`,
    DASHBOARD_STATS: "/api/superadmin/dashboard-stats",
};
