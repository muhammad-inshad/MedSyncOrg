import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import searchReducer from "./search/searchSlice";
import hospitalReducer from "./selectedHospital/hospitalSlice";  

export const store = configureStore({
    reducer: {
        auth: authReducer,
        search: searchReducer,
        hospital: hospitalReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
