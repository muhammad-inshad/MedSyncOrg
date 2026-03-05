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
      .addCase(loadHospitalData.rejected, (state) => {
        state.loading = false;
        state.hospital = null;  // ✅ Reset on error
      });
  },
});

export const { clearHospital } = hospitalSlice.actions;
export default hospitalSlice.reducer;
