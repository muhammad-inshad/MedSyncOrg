import AppRoutes from "./modules/auth/routes/AppRoutes.tsx";
import SuperAdminRoutes from "./modules/superAdmin/routes/SuperAdminRoutes.tsx";
import PatientRouts from "./modules/patient/routes/PatientRoutes.tsx";
import AdminRoutes from "./modules/admin/routes/AdminRoutes.tsx";
import CommenRoute from "./modules/shared/CommonRoute.tsx";
import DoctorRoutes from "./modules/doctor/routes/DoctorRoutes.tsx";
const App = () => {
  return (
    <>
      <AppRoutes />
      <PatientRouts />
       <SuperAdminRoutes/>
      <CommenRoute/>
      <AdminRoutes/>
      <DoctorRoutes/>
    </>
  );
};

export default App;
