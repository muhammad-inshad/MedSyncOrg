import api from "@/lib/api";
import { DOCTOR_MANAGEMENT } from "./doctor.routes";
import type { IPrescriptionData } from "@/interfaces/IAppointment";
import type { CreateDoctorSchedulePayload } from "@/interfaces/IDoctor";

export const doctorApi = {
    editProfile: (data: FormData) =>
        api.patch(DOCTOR_MANAGEMENT.EDIT_PROFILE(), data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),

    reapply: (id: string) =>
        api.patch(DOCTOR_MANAGEMENT.REAPPLY(id)),

    getHospitalDepartments: (hospitalId: string) =>
        api.get(`/api/auth/hospitals/${hospitalId}/departments`),

    getHospitalQualifications: (hospitalId: string) =>
        api.get(`/api/auth/hospitals/${hospitalId}/qualifications`),

    getHospitalSpecializations: (hospitalId: string, departmentId?: string) =>
        api.get(`/api/auth/hospitals/${hospitalId}/specializations${departmentId ? `?departmentId=${departmentId}` : ''}`),

    UpcomingAppointments: ( params?: { page?: number; limit?: number; search?: string; date?: string }) =>
        api.get(DOCTOR_MANAGEMENT.UPCOMING_APPOINTMENTS, { params }),

    doctorApplyleave: (data: { startDate: string; endDate: string; leaveSession?: string; reason?: string; photo?: string | null }) => {
        return api.post(DOCTOR_MANAGEMENT.DOCTOR_APPLAY_LEAVE, data)
    },

    getDoctorLeaves: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
        api.get(DOCTOR_MANAGEMENT.GET_LEAVES, { params }),

    getConsultation: (params?: { page?: number; limit?: number,shift:string }) => 
        api.get(DOCTOR_MANAGEMENT.GET_APPOIMENTS, { params }),

    updateAppointmentStatus: (id: string) =>
        api.patch(`/api/doctor/consultation/${id}/status`),

   savePrescription: (id: string, data: IPrescriptionData) =>
        api.post(DOCTOR_MANAGEMENT.SAVE_PRISCRIPTION, { 
            appointmentId: id, 
            ...data 
        }),
    createDoctorSchedule: (data: CreateDoctorSchedulePayload) =>
        api.post(DOCTOR_MANAGEMENT.CREATEDOCTORSCHEDULE, data),  

    getDoctorSchedules: (params?: { page?: number; limit?: number }) =>
        api.get(DOCTOR_MANAGEMENT.CREATEDOCTORSCHEDULE, { params }),  

    deleteDoctorSchedule: (id: string,status:boolean) =>
        api.patch(`${DOCTOR_MANAGEMENT.CREATEDOCTORSCHEDULE}/${id}`,{status}),
    
};
