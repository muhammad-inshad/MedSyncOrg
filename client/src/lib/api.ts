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

    // Handle Subscription Limit / Expiry
    if (error.response?.status === 402) {
      const message = error.response.data.message || "Subscription limit reached. Please upgrade your plan.";
      localStorage.setItem("pending_toast", JSON.stringify({ message, type: 'error' }));
      window.location.href = "/hospital/subscription";
      return new Promise(() => { }); // Stop further propagation
    }

    if (error.response?.status === 403) {
      console.warn("403 Forbidden detected. Logging out.", error.response?.data);
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

    if (error.response?.status === 413) {
      error.message = "The uploaded file or data is too large. Please ensure the file size is within the allowed limit (e.g., under 4MB).";
      if (!error.response.data) {
        error.response.data = {};
      }
      error.response.data.message = error.message;
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;