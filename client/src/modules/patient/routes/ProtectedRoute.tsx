import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useAppDispatch } from "../../../hooks/redux";
import { initializeAuth } from "../../../store/auth/authThunks";
import type { RootState } from "../../../store/store";
import FullScreenLoader from "../../../components/pages/FullScreenLoader";
import { stopLoading } from "@/store/auth/authSlice";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, userRole, loading } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
      if (!savedRole) {
        dispatch(stopLoading()); 
        return;
      }
    if (!isAuthenticated && loading&&savedRole) {
      dispatch(initializeAuth(savedRole));
    }
  }, [isAuthenticated, loading, dispatch]);

   console.log(isAuthenticated)

  if (loading) return <FullScreenLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }


  if (allowedRoles && !allowedRoles.includes(userRole || "")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute