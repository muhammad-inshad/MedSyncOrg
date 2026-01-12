import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "./auth.type";
import { initializeAuth } from "./authThunks"; 

const initialState: AuthState = {
  user: null,
  userRole: null,
  isAuthenticated: false,
  profileData: null, 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        profileData: any; 
      }>
    ) => {
      state.user = action.payload.user;
      state.profileData = action.payload.profileData;
      state.userRole = action.payload.user.role;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      state.profileData = null;
      state.userRole = null;
      state.isAuthenticated = false;
    },
  }, 
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.profileData = action.payload.profileData;
        state.isAuthenticated = true;
        state.userRole = action.payload.user.role;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.profileData = null;
        state.isAuthenticated = false;
        state.userRole = null;
      });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer; 