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
    getHospitals: async () => {
        const response = await api.get('/api/patient/hospitals');
        return response.data;
    }
};
