import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import axios from 'axios';


export const initializeAuth = createAsyncThunk(
    'auth/initializeAuth',
    async (role: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/${role}/getme`);
            const userData = response.data.user || response.data.data;
            return {
                user: { ...userData, role: role },
                profileData: userData,
            };
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message || 'Session expired'
                );
            }
            return rejectWithValue('An unexpected error occurred');
        }
    }
);