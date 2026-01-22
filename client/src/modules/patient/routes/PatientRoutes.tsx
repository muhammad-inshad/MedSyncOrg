import { Routes, Route } from "react-router-dom";
import { PATIENTROUTES } from "@/constants/routes/routes";
import SelectHospital from "../pages/SelectHospital";
import ProtectedRoute from "./ProtectedRoute"; 
import PatientProfile from "../pages/PatientProfile";
import DoctorRegistration from "../../doctor/pages/DoctorRegistration";

const PatientRouts = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
        <Route path={PATIENTROUTES.SELECTHOSPITAL} element={<SelectHospital />} />
        <Route path={PATIENTROUTES.PATIENTPROFILE} element={<PatientProfile />} />
        <Route path={PATIENTROUTES.DOCTORREGISTRACTIONFORM} element={<DoctorRegistration />} />
      </Route>
    </Routes>
  );
};

export default PatientRouts;