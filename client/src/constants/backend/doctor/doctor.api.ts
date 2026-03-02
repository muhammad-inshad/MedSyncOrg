import api from "@/lib/api";
import { DOCTOR_MANAGEMENT } from "./doctor.routes";

export const doctorApi = {
    editProfile: (id: string, data: FormData) =>
        api.patch(DOCTOR_MANAGEMENT.EDIT_PROFILE(id), data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),

    reapply: (id: string) =>
        api.patch(DOCTOR_MANAGEMENT.REAPPLY(id)),
};
