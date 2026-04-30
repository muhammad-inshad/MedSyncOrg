import type { PaginationParams, UpdateDoctorKycStatusPayload, ToggleStatusData } from "@/interfaces/api.interfaces";
import type { PaymentPayload } from "@/interfaces/ISubscription";
import { HOSPITAL_MANAGEMENT } from "./hospital.routes";
import api from "@/lib/api";

export const hospitalApi = {
    getMe: () =>
        api.get(HOSPITAL_MANAGEMENT.GET_ME),
    getCommonStats: (type: string) =>
  api.get(HOSPITAL_MANAGEMENT.COMMON_STATS, {
    params: { type }
  }),

    editHospital: (data: FormData) =>
        api.patch(HOSPITAL_MANAGEMENT.EDIT_HOSPITAL, data),
    getKycStats: () =>
        api.get(HOSPITAL_MANAGEMENT.KYC_STATS),

    getAllDoctors: (params?: PaginationParams) =>
        api.get(HOSPITAL_MANAGEMENT.GET_ALL_DOCTORS, { params }),

    toggleDoctor: (id: string, data: ToggleStatusData) =>
        api.patch(HOSPITAL_MANAGEMENT.DOCTORS_TOGGLE(id), data),

    togglePatient: (id: string, data: ToggleStatusData) =>
        api.patch(HOSPITAL_MANAGEMENT.PATIENTS_TOGGLE(id), data),

    addPatient: (data: FormData) =>
        api.post(HOSPITAL_MANAGEMENT.PATIENT_ADD, data),

    getDoctorKyc: (params?: PaginationParams) =>
        api.get(HOSPITAL_MANAGEMENT.DOCTOR_KYC, { params }),

    getKycDoctors: (params: PaginationParams) =>
        api.get(HOSPITAL_MANAGEMENT.GET_KYC_DOCTORS, { params }),

    getDepSepQuly:()=>api.get(HOSPITAL_MANAGEMENT.GETDEPSEPQULY),

    updateDoctorKycStatus: (id: string, status: 'approved' | 'rejected' | 'revision', payload?: UpdateDoctorKycStatusPayload) => {
        let endpoint = '';
        if (status === 'approved') endpoint = HOSPITAL_MANAGEMENT.DOCTOR_ACCEPT(id);
        else if (status === 'rejected') endpoint = HOSPITAL_MANAGEMENT.DOCTOR_REJECT(id);
        else if (status === 'revision') endpoint = HOSPITAL_MANAGEMENT.DOCTOR_REVISION(id);
        return api.patch(endpoint, payload);
    },

    getDoctorById: (id: string) =>
        api.get(HOSPITAL_MANAGEMENT.GET_DOCTOR(id)),

    getPatientById: (id: string) =>
        api.get(HOSPITAL_MANAGEMENT.GET_PATIENT(id)),

    editPatient: (id: string, data: FormData) =>
        api.patch(HOSPITAL_MANAGEMENT.EDIT_PATIENT(id), data),

    addDoctor: (data: FormData) =>
        api.post(HOSPITAL_MANAGEMENT.DOCTOR_ADD, data),

    getAllPatients: (params?: PaginationParams) =>
        api.get(HOSPITAL_MANAGEMENT.GET_ALL_PATIENTS, { params }),

    reapply: () =>
        api.patch(HOSPITAL_MANAGEMENT.REAPPLY),

    editHospitalDoctor: (id: string, data: FormData) =>
        api.patch(HOSPITAL_MANAGEMENT.DOCTOR_UPDATE(id), data),
    getHospitalById: (id: string) => {
        return api.get(HOSPITAL_MANAGEMENT.GET_HOSPITAL_DATA(id))
    },
    getDeparment: (params?: { page?: number; limit?: number; search?: string }) => {
        return api.get(HOSPITAL_MANAGEMENT.GET_HOSPITAL_DEPARTMENT, { params })
    },
    createDepartment: (data: FormData) => {
        return api.post(HOSPITAL_MANAGEMENT.CREATEDEPARTMENT, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    updateDepartment: (id: string, data: FormData) => {
        return api.patch(HOSPITAL_MANAGEMENT.UPDATE_DEPARTMENT(id), data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    toggleDepartmentStatus: (id: string) => {
        return api.patch(HOSPITAL_MANAGEMENT.DEPARTMENT_TOGGLE(id));
    },

    // Qualifications
    getQualifications: (params?: { page?: number; limit?: number; search?: string }) => {
        return api.get(HOSPITAL_MANAGEMENT.GET_QUALIFICATION, { params })
    },
    createQualification: (data: FormData) => {
        return api.post(HOSPITAL_MANAGEMENT.CREATE_QUALIFICATION, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    updateQualification: (id: string, data: FormData) => {
        return api.patch(HOSPITAL_MANAGEMENT.UPDATE_QUALIFICATION(id), data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    toggleQualificationStatus: (id: string) => {
        return api.patch(HOSPITAL_MANAGEMENT.QUALIFICATION_TOGGLE(id));
    },

    getSpecializations: (params?: { page?: number; limit?: number; search?: string }) => {
        return api.get(HOSPITAL_MANAGEMENT.GET_SPECIALIZATION, { params })
    },
    createSpecialization: (data: FormData) => {
        return api.post(HOSPITAL_MANAGEMENT.CREATE_SPECIALIZATION, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    updateSpecialization: (id: string, data: FormData) => {
        return api.patch(HOSPITAL_MANAGEMENT.UPDATE_SPECIALIZATION(id), data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    toggleSpecializationStatus: (id: string) => {
        return api.patch(HOSPITAL_MANAGEMENT.SPECIALIZATION_TOGGLE(id));
    },
    getSelectedHospital: (id: string, params?: { page?: number; limit?: number; search?: string }) => {
        return api.get(HOSPITAL_MANAGEMENT.SELECTED_HOSPITAL(id), { params });
    },
    getLeaveFromDoctor: (params?: { page?: number; limit?: number; search?: string; date?: string }) => {
        return api.get(HOSPITAL_MANAGEMENT.GET_LEAVE_DOCTORS, { params });
    },
    updateLeaveStatus: (id: string, data: { status: 'approved' | 'rejected'; rejectedReason?: string }) => {
        return api.patch(HOSPITAL_MANAGEMENT.UPDATE_LEAVE_STATUS(id), data);
    },
    getsubscription: (params?: { page?: number; limit?: number; search?: string }) =>
        api.get(HOSPITAL_MANAGEMENT.GETSUBSCRIPTION(), { params }),

    createPaymentSession: (data: PaymentPayload) =>
    api.post("/api/payment/checkout", data),
    
    getSubscriptonForProtection:()=>{
       return api.get(HOSPITAL_MANAGEMENT.GETSUBCRITPIONPROTECTION)
    },

    getDashboardStats:()=>api.get(HOSPITAL_MANAGEMENT.GETDASHBOARDSTATS),

    getDoctorStatus:() => api.get(HOSPITAL_MANAGEMENT.GET_DOCTOR_STATUS),

    getdoctorsalaryrequest:(params?: {page?: number;limit?: number;status?: string;search?: string;}) =>
        api.get(HOSPITAL_MANAGEMENT.GET_DOCTOR_SALARY_REQUEST,{ 
    params 
  }),

    updateSalaryRequestStatus: (id: string, data: { status: 'APPROVED' | 'REJECTED'; approvedAmount?: number; note: string, hospitalCommission?: number;}) =>
        api.patch(HOSPITAL_MANAGEMENT.UPDATE_DOCTOR_SALARY_REQUEST_STATUS(id), data),
};
                                   