import { DOCTOR_ROUTES } from "@/constants/frontend/doctor/doctor.routes";
import DoctorDashboard from "@/modules/doctor/pages/DoctorDashbord";
import DoctorEditProfile from "../pages/DoctorEditProfile";
import DoctorProfile from "../pages/DoctorProfile";
import { Routes, Route } from "react-router-dom";
import DoctorProtectedRoute from "./DoctorProtectedRoute";


const DoctorRoutes = () => {
  return (
    <Routes>
      <Route element={<DoctorProtectedRoute />}>
        <Route path={DOCTOR_ROUTES.DOCTORDASHBOARD} element={<DoctorDashboard />} />
        <Route path={DOCTOR_ROUTES.DOCTOREDITPROFILE} element={<DoctorEditProfile />} />
        <Route path={DOCTOR_ROUTES.DOCTORPROFILE} element={<DoctorProfile />} />
      </Route>
    </Routes>
  );
};

export default DoctorRoutes