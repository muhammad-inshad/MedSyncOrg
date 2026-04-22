import { DOCTOR_ROUTES } from "@/constants/frontend/doctor/doctor.routes";
import DoctorDashboard from "@/modules/doctor/pages/DoctorDashbord";
import DoctorEditProfile from "../pages/DoctorEditProfile";
import DoctorProfile from "../pages/DoctorProfile";
import { Routes, Route } from "react-router-dom";
import DoctorProtectedRoute from "./DoctorProtectedRoute";
import UpcomingAppointments from "../pages/UpcomingAppointments";
import DoctorLeaveManagement from "../pages/DoctorLeaveManagement";
import DoctorConsultation from "../pages/DoctorConseltation";
import DoctorSlotManagement from "../pages/DoctorSlotManagement";


const DoctorRoutes = () => {
  return (
    <Routes>
      <Route element={<DoctorProtectedRoute />}>
        <Route path={DOCTOR_ROUTES.DOCTORDASHBOARD} element={<DoctorDashboard />} />
        <Route path={DOCTOR_ROUTES.DOCTOREDITPROFILE} element={<DoctorEditProfile />} />
        <Route path={DOCTOR_ROUTES.DOCTORPROFILE} element={<DoctorProfile />} />
        <Route path={DOCTOR_ROUTES.UPCOMING_APPOINTMENTS} element={<UpcomingAppointments />} />
        <Route path={DOCTOR_ROUTES.APPLY_LEAVE} element={<DoctorLeaveManagement />} />
        <Route path={DOCTOR_ROUTES.CONSELTATION} element={<DoctorConsultation/>}/>
        <Route path={DOCTOR_ROUTES.SLOTMANAGEMENT} element={<DoctorSlotManagement/>}/>
      </Route>
    </Routes>
  );
};

export default DoctorRoutes