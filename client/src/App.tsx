import AppRoutes from "./routes/AppRoutes";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import PatientRouts from "./routes/PatientRouts";
import AdminRoutes from "./routes/AdminRoutes";
import CommenRoute from "./modules/shared/CommenRoute";
const App = () => {
  return (
    <>
      <AppRoutes />
      <PatientRouts />
       <SuperAdminRoutes/>
      <CommenRoute/>
      <AdminRoutes/>
    </>
  );
};

export default App;
