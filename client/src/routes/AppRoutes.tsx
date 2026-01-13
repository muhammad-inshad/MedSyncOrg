import { Routes, Route, Navigate } from "react-router-dom";
import { COMMON, PATIENTROUTES } from "@/constants/routes/routes";
import LogIn from "@/modules/auth/Loginpage";
import SignUp from "@/modules/auth/PatientSignupPage";
import OtpPage from "@/modules/auth/OtpPage";
import Forgetpassword from "@/modules/auth/Forgetpassword";

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
      <Route path={COMMON.FORGETPASSWORD} element={<Forgetpassword/>}/>
    </Routes>
  );
};

export default AppRoutes;
