import api from '@/lib/api';
import type { IPatient } from '@/interfaces/IPatient';

export const PatientService = {
    updateProfile: async (id: string, data: Partial<IPatient> & { willRemoveImage?: boolean }) => {
        const response = await api.patch(`/api/patient/patientEdit/${id}`, data);
        return response.data;
    },

    getProfile: async (id: string) => {
        const response = await api.get(`/api/patient/profile/${id}`);
        return response.data;
    },
   getHospitals: async (page: number, limit: number, search: string) => {
    const response = await api.get('/api/patient/hospitals', {
        params: {
            page,
            limit,
            search
        }
    });

    return response.data;
},
    changePassword: async (id: string, data: { currentPassword?: string; newPassword?: string }) => {
        const response = await api.patch(`/api/patient/changePassword/${id}`, data);
        return response.data;
    }
};
