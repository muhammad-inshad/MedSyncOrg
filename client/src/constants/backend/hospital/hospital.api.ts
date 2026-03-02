import api from "@/lib/api";
import type { PaginationParams, UpdateDoctorKycStatusPayload, ToggleStatusData } from "@/interfaces/api.interfaces";
import { HOSPITAL_MANAGEMENT } from "./hospital.routes";

export const hospitalApi = {
    getMe: () =>
        api.get(HOSPITAL_MANAGEMENT.GET_ME),

    editHospital: (id: string, data: FormData) =>
        api.patch(HOSPITAL_MANAGEMENT.EDIT_HOSPITAL(id), data),

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
};
