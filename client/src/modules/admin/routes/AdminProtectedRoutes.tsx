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

    // If no role, stop loading (will redirect in render)
    if (!savedRole) {
      if (loading) dispatch(stopLoading());
      return;
    }

    // If already authenticated and role matches, don't re-initialize
    // If already authenticated:
    if (isAuthenticated && user) {
      // If roles match, stop loading
      if (user.role === savedRole) {
        if (loading) dispatch(stopLoading());
        return;
      }

      // If roles mismatch (e.g. saved='patient' but token='admin'), update savedRole ?
      // Or reject?
      // If we are in AdminProtectedRoute, we EXPECT 'admin' role.
      if (user.role === 'admin') {
        localStorage.setItem("role", "admin");
        if (loading) dispatch(stopLoading());
        return;
      }
    }

    // Otherwise verify/fetch user
    dispatch(initializeAuth(savedRole));

  }, [dispatch, isAuthenticated, user, loading]);

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