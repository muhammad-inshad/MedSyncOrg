import AppRoutes from "./modules/auth/routes/AppRoutes.tsx";
import SuperAdminRoutes from "./modules/superAdmin/routes/SuperAdminRoutes.tsx";
import PatientRouts from "./modules/patient/routes/PatientRoutes.tsx";
import HospitalRoutes from "./modules/hospital/routes/HospitalRoutes.tsx";
import CommenRoute from "./modules/shared/CommonRoute.tsx";
import DoctorRoutes from "./modules/doctor/routes/DoctorRoutes.tsx";
const App = () => {
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
