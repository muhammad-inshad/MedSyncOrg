export const SUPERADMIN_MANAGEMENT = {
  LOGIN: "/api/auth/superadmin/login",
  HOSPITAL_MANAGEMENT: "/api/superadmin/hospitals",
  GET_ME: "/api/superadmin/me",
  SET_ACTIVE: "/api/superadmin/hospitals/active",
  HOSPITALS: "/api/superadmin/hospitals",
  HOSPITAL_STATUS: "/api/superadmin/hospitals/status",
  REAPPLY: "/api/superadmin/reapply",
  KYC_MANAGEMENT: "/api/superadmin/kyc",
  KYC_STATUS: (id: string, status: string) =>
    `/api/superadmin/hospitals/${id}/status/${status}`,
  ADD_HOSPITAL: "/api/superadmin/hospitals",
  EDIT_HOSPITAL: (id: string) => `/api/superadmin/hospitals/${id}`,
  DELETE_HOSPITAL: (id: string) => `/api/superadmin/hospitals/${id}`,
  DASHBOARD_STATS: "/api/superadmin/dashboard/stats",
  TOGGLEPATIENT: "/api/superadmin/patients/active",
  GET_PATINET: "/api/superadmin/patients",
  PATIENT_ADD: "/api/superadmin/patients",
  EDIT_PATIENT: (id: string) => `/api/superadmin/patients/${id}`,

  GET_SUBSCRIPTIONS: "/api/superadmin/subscription",
    CREATE_SUBSCRIPTION: "/api/superadmin/subscription",
  TOGGLE_SUBSCRIPTION: "/api/superadmin/subscription/toggle",
  EDIT_SUBSCRIPTION: (id: string) => `/api/superadmin/subscription/${id}`,
  GET_HOSPITAL_SUBSCRIPTIONS:"/api/superadmin/subscribeHospital",
  GET_WALLET:"/api/superadmin/wallet",
  WITHDRAW:"/api/superadmin/wallet/withdraw"
};
