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

    // Always re-verify on navigation to catch "blocked" status in real-time
    dispatch(initializeAuth(savedRole));

  }, [dispatch, location.pathname]);

  if (loading) return <FullScreenLoader />;

  const savedRole = localStorage.getItem("role");

  if (!isAuthenticated) {
    const loginPath = savedRole ? `/login/${savedRole}` : "/";
    return <Navigate to={loginPath} replace state={{ from: location }} />;
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
    const onAllowedPage =
      location.pathname === COMMON_ROUTES.REVIEWPENDING ||
      location.pathname === DOCTOR_ROUTES.DOCTOREDITPROFILE;
    if (onAllowedPage) {
      return <Outlet />;
    }
    return <Navigate to={COMMON_ROUTES.REVIEWPENDING} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default DoctorProtectedRoute;