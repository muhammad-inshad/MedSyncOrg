import { Navigate, Outlet} from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { useEffect } from "react";
import { initializeAuth } from "@/store/auth/authThunks";
import { useAppDispatch } from "../../../hooks/redux";
import { DOCTORS, PATIENTROUTES, ADMINROUTES, SUPERADMINROUTES } from "@/constants/routes/routes";
import FullScreenLoader from "@/components/pages/FullScreenLoader";
import { stopLoading } from "@/store/auth/authSlice";


const ProtectedRoute = () => {
  const dispatch = useAppDispatch();

  
  const { isAuthenticated, user, loading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (!savedRole) {
      dispatch(stopLoading());
      return;
    }
    if (!isAuthenticated && loading ) {
      dispatch(initializeAuth(savedRole));
    }
  }, [isAuthenticated, loading, dispatch]);

  if (loading) {
    return <FullScreenLoader />;
  }
  if (isAuthenticated && user) {
      const role=user.role.toLowerCase()
   
      if(role==="superadmin")return <Navigate to={SUPERADMINROUTES.DASHBOARD} replace/>
      if (user.role === "doctor") return <Navigate to={DOCTORS.DOCTORDASHBOARD} replace />;
      if (user.role === "admin") return <Navigate to={ADMINROUTES.ADMINDASHBOARD} replace />;
      if (user.role === "patient") return <Navigate to={PATIENTROUTES.SELECTHOSPITAL} replace />;
    }
  
  return <Outlet />;
};

export default ProtectedRoute;