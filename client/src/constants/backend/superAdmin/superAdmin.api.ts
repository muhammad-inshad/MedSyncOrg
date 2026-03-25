import api from "@/lib/api";
import { SUPERADMIN_MANAGEMENT } from "./superAdmin.routes";
import type { LoginData, PaginationParams, HospitalStatusUpdateData, KycStatusUpdateData, SetHospitalActiveData } from "@/interfaces/api.interfaces";
import type { CreateSubscriptionPayload, SubscriptionForm } from "@/interfaces/ISubscription";

export const superAdminApi = {
    login: (data: LoginData) =>
        api.post(SUPERADMIN_MANAGEMENT.LOGIN, data),

    getMe: () =>
        api.get(SUPERADMIN_MANAGEMENT.GET_ME),

    getAllHospitals: (params?: PaginationParams) =>
        api.get(SUPERADMIN_MANAGEMENT.HOSPITALS, { params }),

    updateHospitalStatus: (data: HospitalStatusUpdateData) =>
        api.patch(SUPERADMIN_MANAGEMENT.HOSPITAL_STATUS, data),

    reapplyHospital: (data: { id: string }) =>
        api.post(SUPERADMIN_MANAGEMENT.REAPPLY, data),

    getKycManagement: (params?: PaginationParams) =>
        api.get(SUPERADMIN_MANAGEMENT.KYC_MANAGEMENT, { params }),

    updateKycStatus: ({ id, status, reason }: KycStatusUpdateData) =>
        api.patch(
            SUPERADMIN_MANAGEMENT.KYC_STATUS(id, status),
            { reason }
        ),

    addHospital: (data: FormData) =>
        api.post(SUPERADMIN_MANAGEMENT.ADD_HOSPITAL, data),

    editHospital: (id: string, data: FormData) =>
        api.patch(SUPERADMIN_MANAGEMENT.EDIT_HOSPITAL(id), data),

    deleteHospital: (id: string) =>
        api.delete(SUPERADMIN_MANAGEMENT.DELETE_HOSPITAL(id)),

    getDashboardStats: () =>
        api.get(SUPERADMIN_MANAGEMENT.DASHBOARD_STATS),

    getHospitalManagement: (params: PaginationParams) =>
        api.get(SUPERADMIN_MANAGEMENT.HOSPITAL_MANAGEMENT, { params }),

    setHospitalActive: (data: SetHospitalActiveData) =>
        api.patch(SUPERADMIN_MANAGEMENT.SET_ACTIVE, data),

   getPatientManagement: (params: PaginationParams) =>
    api.get(SUPERADMIN_MANAGEMENT.GET_PATINET, { params }),

  togglePatient: (data: { id: string; isActive: boolean }) =>
  api.patch(SUPERADMIN_MANAGEMENT.TOGGLEPATIENT, data),

  addPatient: (data: FormData) =>
        api.post(SUPERADMIN_MANAGEMENT.PATIENT_ADD, data),
   editPatient: (id: string, data: FormData) =>
        api.patch(SUPERADMIN_MANAGEMENT.EDIT_PATIENT(id), data),
        
   getSubscriptionManagement: (params: PaginationParams & { search?: string; status?: string }) =>
        api.get(SUPERADMIN_MANAGEMENT.GET_SUBSCRIPTIONS, { params }),

 createSubscription:(data?:CreateSubscriptionPayload)=>{
         api.post(SUPERADMIN_MANAGEMENT.CREATE_SUBSCRIPTION, data);
    },

   editSubscription: (id: string, data: SubscriptionForm) =>
        api.patch(SUPERADMIN_MANAGEMENT.EDIT_SUBSCRIPTION(id), data),

   toggleSubscription: (data: { id: string; isActive: boolean }) =>
        api.patch(SUPERADMIN_MANAGEMENT.TOGGLE_SUBSCRIPTION, data),
};
