import { createSlice } from "@reduxjs/toolkit";
import { loadHospitalData } from "./authThunk";
import type { HospitalResponseDTO } from "@/dto/hospital/HospitalResponseDTO";

interface HospitalState {  
  hospital: HospitalResponseDTO | null;  
  loading: boolean;
}

const initialState: HospitalState = {
  hospital: null, 
  loading: false,
};

const hospitalSlice = createSlice({
  name: "hospital",
  initialState,
  reducers: {
    clearHospital: (state) => {
      state.hospital = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadHospitalData.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadHospitalData.fulfilled, (state, action) => {
        state.loading = false;
        state.hospital = action.payload;
      })
      .addCase(loadHospitalData.rejected, (state, action) => {
        state.loading = false;
        // Keep the existing hospital data if it's a 402 error so the modal can show it
        const payload = action.payload as any;
        if (payload?.status !== 402) {
          state.hospital = null;
        }
      });
  },
});

export const { clearHospital } = hospitalSlice.actions;
export default hospitalSlice.reducer;
