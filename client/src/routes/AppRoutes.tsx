import { Routes, Route, Navigate } from "react-router-dom";
import { PATIENTROUTES } from "@/constants/routes/routes";
import LogIn from "@/modules/auth/Loginpage";
import SignUp from "@/modules/auth/PatientSignupPage";
import OtpPage from "@/modules/auth/OtpPage";

const AppRoutes = () => {
  return (
    <Routes>
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
    </Routes>
  );
};

export default AppRoutes;
