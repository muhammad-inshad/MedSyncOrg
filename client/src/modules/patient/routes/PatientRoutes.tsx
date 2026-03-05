import { Routes, Route } from "react-router-dom";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";
import SelectHospital from "../pages/SelectHospital";
import ProtectedRoute from "./ProtectedRoute";
import PatientProfile from "../pages/PatientProfile";
import EditPatientProfile from "../components/patient/EditPatientProfile";
import PatientHospitalHome from "../pages/PatientHospitalHome";
import PatientDoctor from "../pages/PatientDoctor";
import PatientAppointment from "../pages/PatientAppoiment";
import HospitalProtectedRoute from "./HospitalProtectedRoute";
import HospitalDepartments from "../pages/HospitalDeprtements";
import DoctorProfile from "../pages/DoctorProfile";


const PatientRouts = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
        <Route path={PATIENT_ROUTES.SELECTHOSPITAL} element={<SelectHospital />} />
        <Route path={PATIENT_ROUTES.PATIENTPROFILE} element={<PatientProfile />} />
        <Route path={PATIENT_ROUTES.PATIENTEDIT} element={<EditPatientProfile/>}/>
        <Route element={<HospitalProtectedRoute/>}>
        <Route path={PATIENT_ROUTES.HOSPITAL_HOMEPAGE} element={<PatientHospitalHome/>}/>
        <Route path={PATIENT_ROUTES.HOSPITAL_DOCTOR} element={<PatientDoctor/>}/>
        <Route path={PATIENT_ROUTES.DOCTOR_APPOIMENT} element={<PatientAppointment/>}/>
        <Route path={PATIENT_ROUTES.DOCTOR_PROFILE} element={<DoctorProfile/>}/>
        <Route path={PATIENT_ROUTES.HOSPITAL_DEPaRTMENTS} element={<HospitalDepartments/>}/>
        </Route>
      </Route>
    </Routes>
  );
};

export default PatientRouts;