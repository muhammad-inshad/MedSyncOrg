import { DOCTORS } from "@/constants/routes/routes";
import DoctorDashboard from "@/modules/doctor/pages/DoctorDashbord";
import { Routes, Route} from "react-router-dom";
import AdminProtectedRoute from "./AdminProtectedRoute";


const DoctorRoutes = () => {
 return (
    <Routes>
      <Route element={<AdminProtectedRoute />}>
        <Route path={DOCTORS.DOCTORDASHBOARD} element={<DoctorDashboard />} />    
      </Route>
    </Routes>
  );
};

export default DoctorRoutes