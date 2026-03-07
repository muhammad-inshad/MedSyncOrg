import api from "@/lib/api";
import { PATIENT_MANAGEMENT } from "./patient.routes";

export const patientApi = {
    getMe: () =>
        api.get(PATIENT_MANAGEMENT.GET_ME),

    updateProfile: (data: FormData) =>
        api.put(PATIENT_MANAGEMENT.UPDATE_PROFILE, data),
    get_hospital: (id: string, page: number = 1, limit: number = 6, search: string = "") => {
        return api.get(`${PATIENT_MANAGEMENT.GET_SELECTED_HOSPITAL(id)}?page=${page}&limit=${limit}&search=${search}`)
    },
    getDoctorsByDepartment: (id: string, page: number = 1, limit: number = 6, search: string = "") => {
        return api.get(`${PATIENT_MANAGEMENT.GET_DOCTOR_DEPARTMENT(id)}?page=${page}&limit=${limit}&search=${search}`)
    },
    getDoctorDetails: (id: string) => {
        return api.get(PATIENT_MANAGEMENT.GET_DOCTOR_DETAILS(id))
    },
    getAvailableSlots: (doctorId: string, date: string) => {
        return api.get(`${PATIENT_MANAGEMENT.GET_AVAILABLE_SLOTS(doctorId)}?date=${date}`)
    },
    bookAppointment: (data: any) => {
        return api.post(PATIENT_MANAGEMENT.BOOK_APPOINTMENT, data)
    }
};
