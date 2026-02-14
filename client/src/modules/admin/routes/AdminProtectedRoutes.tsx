import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../../../store/store";
import { useAppDispatch } from "../../../hooks/redux";
import { initializeAuth } from "@/store/auth/authThunks";
import { stopLoading, logout } from "@/store/auth/authSlice";
import FullScreenLoader from "@/components/FullScreenLoader";

import { COMMON_ROUTES } from "@/constants/frontend/common/common.routes";

interface MongooseUser {
  _doc?: Record<string, unknown>;
  reviewStatus?: string;
}

const AdminProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (!savedRole) {
      dispatch(stopLoading());
      return;
    }

    dispatch(initializeAuth(savedRole));

  }, [location.pathname, dispatch]);

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
        to="/login/admin"
        state={{ blockedMessage: "This admin account is currently blocked. Contact the hospital owner." }}
        replace
      />
    );
  }

  const reviewStatus = userData?.reviewStatus;
  if (reviewStatus !== "approved") {
    return <Navigate to={COMMON_ROUTES.REVIEWPENDING} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;