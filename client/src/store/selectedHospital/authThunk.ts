import { patientApi } from "@/constants/backend/patient/patient.api";
import { createAsyncThunk } from "@reduxjs/toolkit";  
import { AxiosError } from "axios"; 

export const loadHospitalData = createAsyncThunk(
    "patient/loadHospitalData",
    async (hospitalId: string, { rejectWithValue }) => {
        try {
            const response = await patientApi.get_hospital(hospitalId);
            return response.data.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data || { message: 'Server error' });
            }
            return rejectWithValue({ message: 'Network error' });
        }
    }
);
