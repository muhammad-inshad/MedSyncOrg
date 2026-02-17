import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, BaseUser, ProfileData } from "./auth.type";
import { initializeAuth } from "./authThunks";

const initialState: AuthState = {
    user: null,
    userRole: null,
    isAuthenticated: false,
    profileData: null,
    loading: true,
    isActive: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (
            state,
            action: PayloadAction<{ user: BaseUser; profileData: ProfileData }>
        ) => {
            const { user, profileData } = action.payload;
            state.user = user;
            state.profileData = profileData;
            state.userRole = user.role;
            state.isAuthenticated = true;
            state.loading = false;
            state.isActive = user.isActive;
        },
        stopLoading: (state) => {
            state.loading = false;
        },
        logout: (state) => {
            state.user = null;
            state.profileData = null;
            state.userRole = null;
            state.isAuthenticated = false;
            state.isActive = true;
            state.loading = false;
            // Clear localStorage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("role");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                const { user, profileData } = action.payload;
                state.user = user;
                state.profileData = profileData;
                state.userRole = user.role;
                state.isAuthenticated = true;
                state.isActive = user.isActive;
                state.loading = false;
            })
            .addCase(initializeAuth.rejected, (state) => {
                state.user = null;
                state.profileData = null;
                state.userRole = null;
                state.isAuthenticated = false;
                state.isActive = true;
                state.loading = false;
            });
    },
});

export const { loginSuccess, logout, stopLoading } = authSlice.actions;
export default authSlice.reducer;