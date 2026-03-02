import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useAppDispatch } from "../../../hooks/redux";
import { initializeAuth } from "../../../store/auth/authThunks";
import type { RootState } from "../../../store/store";
import FullScreenLoader from "../../../components/FullScreenLoader";
import { stopLoading } from "@/store/auth/authSlice";

const ProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    const savedRole = localStorage.getItem("role")?.toLowerCase();
    if (!savedRole) {
      dispatch(stopLoading());
      return;
    }
    if (!isAuthenticated && loading && savedRole) {
      dispatch(initializeAuth(savedRole));
    }
  }, [isAuthenticated, loading, dispatch]);

  if (loading) return <FullScreenLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute