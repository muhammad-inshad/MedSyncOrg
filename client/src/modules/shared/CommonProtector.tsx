import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../../store/store";
import { useAppDispatch } from "../../hooks/redux";
import { initializeAuth } from "@/store/auth/authThunks";
import { stopLoading } from "@/store/auth/authSlice";
import FullScreenLoader from "@/components/FullScreenLoader";
import { ADMIN_ROUTES } from "@/constants/frontend/admin/admin.routes";
import { DOCTOR_ROUTES } from "@/constants/frontend/doctor/doctor.routes";
import { COMMON_ROUTES } from "@/constants/frontend/common/common.routes";

interface MongooseUser {
  _doc?: Record<string, unknown>;
  reviewStatus?: string;
}

const CommonProtector = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (!savedRole) {
      dispatch(stopLoading());
      return;
    }
    dispatch(initializeAuth(savedRole));
  }, [dispatch]);

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
      (!isDoctor && location.pathname === COMMON_ROUTES.ADMINEDITPROFILE) ||
      (isDoctor && location.pathname === DOCTOR_ROUTES.DOCTOREDITPROFILE);

    if (!onAllowedPage) {
      return <Navigate to={COMMON_ROUTES.REVIEWPENDING} replace />;
    }
    return <Outlet />;
  }

  if (location.pathname === COMMON_ROUTES.REVIEWPENDING || location.pathname === "/") {
    const destination = savedRole === "doctor" ? DOCTOR_ROUTES.DOCTORDASHBOARD : ADMIN_ROUTES.ADMINDASHBOARD;
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};

export default CommonProtector;