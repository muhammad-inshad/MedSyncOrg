import axios from "axios";
import { store } from "@/store/store";
import { logout } from "@/store/auth/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest.url.includes("/api/auth/refresh")) {
      store.dispatch(logout());
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject(error);
        }
        
        const refreshResponse = await api.post("/api/auth/refresh", { 
          refreshToken 
        });
        
        // Update the access token in localStorage from the response
        if (refreshResponse.data?.data?.accessToken) {
          localStorage.setItem("accessToken", refreshResponse.data.data.accessToken);
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`;
        }
        
        return api(originalRequest); 
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;