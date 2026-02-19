import axios from "axios";
import { store } from "@/store/store";
import { logout } from "@/store/auth/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Request interceptor (Simplified: Cookies are handled automatically)
api.interceptors.request.use(
  (config) => config,
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
        // Attempt to refresh using the refresh cookie (handled by backend)
        await api.post("/api/auth/refresh");

        // Retry the original request (new access cookie will be sent automatically)
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