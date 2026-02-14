import { Routes, Route } from "react-router-dom";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";
import SelectHospital from "../pages/SelectHospital";
import ProtectedRoute from "./ProtectedRoute";
import PatientProfile from "../pages/PatientProfile";
import DoctorRegistration from "../../doctor/pages/DoctorRegistration";
import EditPatientProfile from "../components/patient/EditPatientProfile";

const PatientRouts = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
        <Route path={PATIENT_ROUTES.SELECTHOSPITAL} element={<SelectHospital />} />
        <Route path={PATIENT_ROUTES.PATIENTPROFILE} element={<PatientProfile />} />
        <Route path={PATIENT_ROUTES.DOCTORREGISTRACTIONFORM} element={<DoctorRegistration />} />
        <Route path={PATIENT_ROUTES.PATIENTEDIT} element={<EditPatientProfile/>}/>
      </Route>
    </Routes>
  );
};

export default PatientRouts;