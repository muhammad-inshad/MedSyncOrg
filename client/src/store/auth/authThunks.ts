
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api'; 
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
     
      const response = await api.get('/patient/getme');  
      return {
         user: response.data.data, 
        profileData: response.data.data,
      };
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || 'Session expired');
    }
  }
);