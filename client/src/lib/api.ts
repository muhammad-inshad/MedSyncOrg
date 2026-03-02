import axios from "axios";
import { store } from "@/store/store";
import { logout } from "@/store/auth/authSlice";
import toast from "react-hot-toast";

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

    if (error.response?.status === 403) {
      localStorage.removeItem("role");
      store.dispatch(logout());

      const isLogin = originalRequest.url.includes("/login");
      const isGetMe = originalRequest.url.includes("/getme");

      if (isLogin) {

        return Promise.reject(error);
      }

      toast.error(error.response?.data?.message || "Account is blocked or inactive", {
        id: "blocked-account-toast",
      });

      if (isGetMe) {

        return Promise.reject(error);
      }

      return new Promise(() => { });
    }


    if (originalRequest.url.includes("/api/auth/refresh")) {
      store.dispatch(logout());
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post("/api/auth/refresh");
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