import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../../store/store";
import { useAppDispatch } from "../../hooks/redux";
import { initializeAuth } from "@/store/auth/authThunks";
import { stopLoading } from "@/store/auth/authSlice";
import FullScreenLoader from "@/components/FullScreenLoader";
import { HOSPITAL_ROUTES } from "@/constants/frontend/hospital/hospital.routes";
import { DOCTOR_ROUTES } from "@/constants/frontend/doctor/doctor.routes";
import { COMMON_ROUTES } from "@/constants/frontend/common/common.routes";
import { SUPERADMIN_ROUTES } from "@/constants/frontend/superAdmin/superAdmin.routes";

interface MongooseUser {
  _doc?: Record<string, unknown>;
  reviewStatus?: string;
}

const CommonProtector = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (!savedRole) {
      dispatch(stopLoading());
      return;
    }
    if (savedRole === "Superadmin") {
      navigate(SUPERADMIN_ROUTES.DASHBOARD)
    } else {
      dispatch(initializeAuth(savedRole));
    }
  }, [dispatch, location.pathname]);

  if (loading) return <FullScreenLoader />;

  const savedRole = localStorage.getItem("role");

  if (!isAuthenticated) {
    const loginPath = savedRole ? `/login/${savedRole}` : "/";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  const rawUser = user as (typeof user & MongooseUser);
  const userData = rawUser?._doc ? (rawUser._doc) : rawUser;
  const status = userData?.reviewStatus;

  if (status !== "approved") {
    const isDoctor = savedRole === "doctor";
    const onAllowedPage = location.pathname === COMMON_ROUTES.REVIEWPENDING ||
      (!isDoctor && (
        location.pathname === COMMON_ROUTES.ADMINEDITPROFILE ||
        location.pathname === HOSPITAL_ROUTES.HOSPITALEDIT ||
        location.pathname === HOSPITAL_ROUTES.HOSPITALEDITFORREVIEW
      )) ||
      (isDoctor && (
        location.pathname === DOCTOR_ROUTES.DOCTOREDITPROFILE ||
        location.pathname === DOCTOR_ROUTES.DOCTOREDITFORREVIEW
      ));

    if (!onAllowedPage) {
      return <Navigate to={COMMON_ROUTES.REVIEWPENDING} replace />;
    }
    return <Outlet />;
  }

  if (location.pathname === COMMON_ROUTES.REVIEWPENDING || location.pathname === "/") {
    const destination = savedRole === "doctor" ? DOCTOR_ROUTES.DOCTORDASHBOARD : HOSPITAL_ROUTES.HOSPITALDASHBOARD;
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};

export default CommonProtector;