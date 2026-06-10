import api from '@/lib/api';
import type { IPatient } from '@/interfaces/IPatient';

export const PatientService = {
    updateProfile: async ( data: Partial<IPatient> & { willRemoveImage?: boolean }) => {
        const response = await api.patch(`/api/patient/patients`, data);
        return response.data;
    },

    getProfile: async (id: string) => {
        const response = await api.get(`/api/patient/profile/${id}`);
        return response.data;
    },
   getHospitals: async (page: number, limit: number, search: string, location: string = "") => {
    const response = await api.get('/api/patient/hospitals', {
        params: {
            page,
            limit,
            search,
            location
        }
    });

    return response.data;
},
    changePassword: async ( data: { currentPassword?: string; newPassword?: string }) => {
        const response = await api.patch(`/api/patient/patients/password`, data);
        return response.data;
    }
};
