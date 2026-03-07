import { patientApi } from "@/constants/backend/patient/patient.api";
import { hospitalApi } from "@/constants/backend/hospital/hospital.api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type { RootState } from "../store";

export const loadHospitalData = createAsyncThunk(
    "hospital/loadHospitalData",
    async (params: { hospitalId: string, page?: number, limit?: number, search?: string }, { rejectWithValue, getState }) => {
        try {
            const { hospitalId, page, limit, search } = params;
            const state = getState() as RootState;
            const role = state.auth.user?.role;

            let response;
            if (role === 'hospital') {
                response = await hospitalApi.getSelectedHospital(hospitalId, { page, limit, search });
            } else {
                response = await patientApi.get_hospital(hospitalId, page, limit, search);
            }
            return response.data.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data || { message: 'Server error' });
            }
            return rejectWithValue({ message: 'Network error' });
        }
    }
);
