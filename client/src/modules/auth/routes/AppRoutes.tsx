import { Routes, Route, Navigate } from "react-router-dom";
import { COMMON_ROUTES } from "@/constants/frontend/common/common.routes";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";
import LogIn from "../pages/Loginpage";
import SignUp from "@/modules/auth/pages/PatientSignupPage";
import OtpPage from "../pages/OtpPage";
import Forgetpassword from "@/modules/auth/pages/Forgetpassword";
import ResetPassword from "@/modules/auth/pages/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import GoogleCallback from "../pages/GoogleCallback";
const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route
          path={PATIENT_ROUTES.ROOT}
          element={
            <Navigate
              to={PATIENT_ROUTES.LOGIN.replace(":role", "patient")}
            />
          }
        />
        <Route path={PATIENT_ROUTES.LOGIN} element={<LogIn />} />
        <Route path={PATIENT_ROUTES.SIGNUP} element={<SignUp />} />
        <Route path={PATIENT_ROUTES.OTP} element={<OtpPage />} />
        <Route path={COMMON_ROUTES.FORGETPASSWORD} element={<Forgetpassword />} />
        <Route path={COMMON_ROUTES.RESETPASSWORD} element={<ResetPassword />} />
        <Route path="/api/auth/google-success" element={<GoogleCallback />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;