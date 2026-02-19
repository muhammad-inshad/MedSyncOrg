import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../../../store/store";
import { useAppDispatch } from "../../../hooks/redux";
import { initializeAuth } from "@/store/auth/authThunks";
import { stopLoading, logout } from "@/store/auth/authSlice";
import FullScreenLoader from "@/components/FullScreenLoader";

import { COMMON_ROUTES } from "@/constants/frontend/common/common.routes";
import { DOCTOR_ROUTES } from "@/constants/frontend/doctor/doctor.routes";

interface MongooseUser {
  _doc?: Record<string, unknown>;
  reviewStatus?: string;
}

const DoctorProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const savedRole = localStorage.getItem("role");

    if (!savedRole) {
      if (loading) dispatch(stopLoading());
      return;
    }

    if (isAuthenticated && user?.role === savedRole) {
      if (loading) dispatch(stopLoading());
      return;
    }

    dispatch(initializeAuth(savedRole));

  }, [dispatch, isAuthenticated, user?.role, loading]);

  if (loading) return <FullScreenLoader />;

  const savedRole = localStorage.getItem("role");

  if (!isAuthenticated) {
    const loginPath = savedRole ? `/login/${savedRole}` : "/";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  const rawUser = user as (typeof user & MongooseUser);
  const userData = rawUser?._doc ? (rawUser._doc) : rawUser;
  const isActive = userData?.isActive;

  if (isActive === false) {
    localStorage.removeItem("role");
    dispatch(logout());

    return (
      <Navigate
        to="/login/doctor"
        state={{ blockedMessage: "You are currently blocked. Please contact the hospital admin." }}
        replace
      />
    );
  }

  const reviewStatus = userData?.reviewStatus;
  if (reviewStatus !== "approved") {
    // BUG FIX: Allow doctor to reach edit profile page for revision
    if (location.pathname === DOCTOR_ROUTES.DOCTOREDITPROFILE) {
      return <Outlet />;
    }
    return <Navigate to={COMMON_ROUTES.REVIEWPENDING} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default DoctorProtectedRoute;