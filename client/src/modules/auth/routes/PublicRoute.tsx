import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { useEffect } from "react";
import { initializeAuth } from "@/store/auth/authThunks";
import { useAppDispatch } from "../../../hooks/redux";
import { DOCTOR_ROUTES } from "@/constants/frontend/doctor/doctor.routes";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";
import { HOSPITAL_ROUTES } from "@/constants/frontend/hospital/hospital.routes";
import { SUPERADMIN_ROUTES } from "@/constants/frontend/superAdmin/superAdmin.routes";
import FullScreenLoader from "@/components/FullScreenLoader";
import { stopLoading } from "@/store/auth/authSlice";


const PublicRoute = () => {
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
    if (!isAuthenticated && loading) {
      dispatch(initializeAuth(savedRole));
    }
  }, [isAuthenticated, loading, dispatch]);

  if (loading) {
    return <FullScreenLoader />;
  }
  console.log(isAuthenticated)
  if (isAuthenticated && user) {
    const role = user.role.toLowerCase()
    console.log(role)
    if (role === "superadmin") return <Navigate to={SUPERADMIN_ROUTES.DASHBOARD} replace />
    if (user.role === "doctor") return <Navigate to={DOCTOR_ROUTES.DOCTORDASHBOARD} replace />;
    if (user.role === "hospital") return <Navigate to={HOSPITAL_ROUTES.HOSPITALDASHBOARD} replace />;
    if (user.role === "patient") return <Navigate to={PATIENT_ROUTES.SELECTHOSPITAL} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;