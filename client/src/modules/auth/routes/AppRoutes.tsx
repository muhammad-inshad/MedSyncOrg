import { Routes, Route, Navigate } from "react-router-dom";
import { COMMON, PATIENTROUTES } from "@/constants/routes/routes";
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
      <Route element={<ProtectedRoute/>}>
        <Route
          path={PATIENTROUTES.ROOT}
          element={
            <Navigate
              to={PATIENTROUTES.LOGIN.replace(":role", "patient")}
            />
          }
        />
        <Route path={PATIENTROUTES.LOGIN} element={<LogIn />} />
        <Route path={PATIENTROUTES.SIGNUP} element={<SignUp/>}/>
        <Route path={PATIENTROUTES.OTP} element={<OtpPage/>}/>
        <Route path={COMMON.FORGETPASSWORD} element={<Forgetpassword/>}/>
        <Route path={COMMON.RESETPASSWORD} element={<ResetPassword/>}/>
        <Route path="/api/auth/google-success" element={<GoogleCallback />} />
      </Route>
      
    </Routes>
  );
};

export default AppRoutes;