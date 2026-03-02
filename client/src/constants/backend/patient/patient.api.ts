import api from "@/lib/api";
import { PATIENT_MANAGEMENT } from "./patient.routes";

export const patientApi = {
    getMe: () =>
        api.get(PATIENT_MANAGEMENT.GET_ME),

    updateProfile: (data: FormData) =>
        api.put(PATIENT_MANAGEMENT.UPDATE_PROFILE, data),


};
