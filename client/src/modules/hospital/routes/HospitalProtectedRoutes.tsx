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

const HospitalProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
  const savedRole = localStorage.getItem("role");
  if (!savedRole || isAuthenticated) {  
    if (loading) dispatch(stopLoading());
    return;
  }
  dispatch(initializeAuth(savedRole));
}, [dispatch, isAuthenticated, loading]); 

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
        to="/login/hospital"
        state={{ blockedMessage: "This account is currently blocked. Contact support." }}
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

export default HospitalProtectedRoute;