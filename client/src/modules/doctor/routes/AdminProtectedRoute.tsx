import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../../../store/store";
import { useAppDispatch } from "../../../hooks/redux";
import { initializeAuth } from "@/store/auth/authThunks";
import { stopLoading } from "@/store/auth/authSlice";
import FullScreenLoader from "@/components/pages/FullScreenLoader";
import { ADMINROUTES, COMMON, DOCTORS } from "@/constants/routes/routes";

interface MongooseUser {
  _doc?: Record<string, unknown>;
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
    if (!isAuthenticated && savedRole) {
      dispatch(initializeAuth(savedRole));
    }
  }, [isAuthenticated, dispatch]);

  if (loading) return <FullScreenLoader />;
  const savedRole = localStorage.getItem("role");
  if (!isAuthenticated) {
    const loginPath = savedRole ? `/login/${savedRole}` : "/";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }
  
  const rawUser = user as (typeof user & MongooseUser);
 
  const userData = rawUser?._doc ? (rawUser._doc as unknown as typeof user) : rawUser;
  const isActive = userData?.isActive;


  if (user?.role === "doctor"|| user?.role === "admin") {
  if (isActive === false && location.pathname !== COMMON.REVIEWPENDING) {
  return <Navigate to={COMMON.REVIEWPENDING} replace />;
}

    if(user?.role === "doctor"){
    if (isActive === true && location.pathname === COMMON.REVIEWPENDING) {
      return <Navigate to={DOCTORS.DOCTORDASHBOARD} replace />;
    }
  }

   if(user?.role === "admin"){
    if (isActive === true && location.pathname === COMMON.REVIEWPENDING) {
      return <Navigate to={ADMINROUTES.ADMINDASHBOARD} replace />;
    }
  }
  }

  return <Outlet />;
};

export default AdminProtectedRoute;