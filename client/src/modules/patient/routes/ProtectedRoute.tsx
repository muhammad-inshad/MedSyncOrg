import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useAppDispatch } from "../../../hooks/redux";
import { initializeAuth } from "../../../store/auth/authThunks";
import type { RootState } from "../../../store/store";
import FullScreenLoader from "../../../components/FullScreenLoader";
import { stopLoading, logout } from "@/store/auth/authSlice";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, userRole, loading, isActive } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");

    if (!savedRole) {
      dispatch(stopLoading());
      return;
    }

    // Only verify on component mount, not on every navigation
    dispatch(initializeAuth(savedRole));
  }, [dispatch]); // Removed location.pathname

  if (loading) return <FullScreenLoader />;

  // 1. Check Authentication
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isActive === false) {
    localStorage.removeItem("role");
    setTimeout(() => dispatch(logout()), 0);
    return <Navigate to="/" state={{ blockedMessage: "You are currently blocked." }} replace />;
  }

  // 3. Check Role
  if (allowedRoles && !allowedRoles.includes(userRole || "")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;