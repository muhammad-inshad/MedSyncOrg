import api from "@/lib/api";
import { PATIENT_MANAGEMENT } from "./patient.routes";

interface IBookingData {
    doctorId: string;
    hospitalId: string;
    appointmentDate: string;
    mode: "offline" | "online" | string;
    patientDetails: {
        name: string;
        age: number;
        phone: string;
        email: string;
        address: string;
    };
    bloodPressure: string;
    heartRate: string;
    weight: string;
    session?: "morning" | "afternoon" | "evening";
    doctorName?: string;
    totalAmount?: number|null;
}

export const patientApi = {
    getMe: () =>
        api.get(PATIENT_MANAGEMENT.GET_ME),

    getPatientStatus: () =>
        api.get(PATIENT_MANAGEMENT.STATUS),

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
    bookAppointment: (data: IBookingData) => {
        return api.post(PATIENT_MANAGEMENT.BOOK_APPOINTMENT, data)
    },
    checkDuplicateAppointment: (data: { doctorId: string, date: string, patient: { name: string, age: number, email?: string } }) => {
        return api.post(PATIENT_MANAGEMENT.CHECK_DUPLICATE_APPOINTMENT, data)
    },
    getAppoimentHistory: ( page: number = 1, limit: number = 5, search: string = "") => {
        return api.get(`${PATIENT_MANAGEMENT.APPOIMENTHISTORY}?page=${page}&limit=${limit}&search=${search}`)
    },
    cancelAppointment: (appointmentId: string, data: { reason: string }) => {
        return api.patch(PATIENT_MANAGEMENT.CANCEL_APPOINTMENT(appointmentId), data);
    },
    getliveToken: (doctorId?: string) => {
        return api.get(`${PATIENT_MANAGEMENT.LIVETOKEN}${doctorId ? `?doctorId=${doctorId}` : ""}`);
    },
    getTodayAppointments: () => {
        return api.get(PATIENT_MANAGEMENT.TODAY_APPOINTMENTS);
    },
      
    createAppointmentPaymentSession: (data: { bookingData: IBookingData }) =>
        api.post("/api/payment/appointment-checkout", data),
    checkAppointmentStatus: (sessionId: string) =>
        api.get(PATIENT_MANAGEMENT.CHECK_APPOINTMENT_STATUS(sessionId)),

    getPrescriptions: ( page: number = 1, limit: number = 5, search: string = "") => 
         api.get(`${PATIENT_MANAGEMENT.PRESCRIPTIONS}?page=${page}&limit=${limit}&search=${search}`),

    getDoctorfee: (doctorId: string) =>
        api.get(PATIENT_MANAGEMENT.GET_DOCTOR_FEE(doctorId)),
    
};
