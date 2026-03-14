import { useEffect } from "react";
import toast from "react-hot-toast";
import AppRoutes from "./modules/auth/routes/AppRoutes.tsx";
import SuperAdminRoutes from "./modules/superAdmin/routes/SuperAdminRoutes.tsx";
import PatientRouts from "./modules/patient/routes/PatientRoutes.tsx";
import HospitalRoutes from "./modules/hospital/routes/HospitalRoutes.tsx";
import CommenRoute from "./modules/shared/CommonRoute.tsx";
import DoctorRoutes from "./modules/doctor/routes/DoctorRoutes.tsx";

const App = () => {
  useEffect(() => {
    // Check for "pending" toasts that should survive a page reload
    const pendingToastData = localStorage.getItem("pending_toast");
    if (pendingToastData) {
      try {
        const { message, type } = JSON.parse(pendingToastData);
        if (type === 'success') toast.success(message);
        else toast.error(message);
      } catch (e) {
        console.error("Failed to parse pending toast", e);
      }
      localStorage.removeItem("pending_toast");
    }
  }, []);

  return (
    <>
      <AppRoutes />
      <PatientRouts />
      <SuperAdminRoutes />
      <CommenRoute />
      <HospitalRoutes />
      <DoctorRoutes />
    </>
  );
};

export default App;
