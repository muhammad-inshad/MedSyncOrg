import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, BaseUser,ProfileData } from "./auth.type";
import { initializeAuth } from "./authThunks"; 

const initialState: AuthState = {
  user: null,
  userRole: null,
  isAuthenticated: false,
  profileData: null, 
  loading: true, 
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
  loginSuccess: (state, action: PayloadAction<{ user: BaseUser; profileData: ProfileData }>) => {
  state.user = action.payload.user;
  state.profileData = action.payload.profileData;
  state.userRole = action.payload.user.role;
  state.isAuthenticated = true;
  state.loading = false;
},
stopLoading: (state) => {
      state.loading = false;
    },

    logout: (state) => {
      state.user = null;
      state.profileData = null;
      state.userRole = null;
      state.isAuthenticated = false;
      state.loading = false; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.profileData = action.payload.profileData;
        state.isAuthenticated = true;
        state.userRole = action.payload.user.role;
        state.loading = false; 
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.profileData = null;
        state.isAuthenticated = false;
        state.userRole = null;
        state.loading = false; 
      });
  },
});
export const { loginSuccess, logout,stopLoading } = authSlice.actions;
export default authSlice.reducer; 