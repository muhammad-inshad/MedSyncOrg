import { Routes, Route} from "react-router-dom";
import { PATIENTROUTES } from "@/constants/routes/routes";
import SelectHospital from "@/modules/patient/SelectHospital";
import ProtectedRoute from "./ProtectedRoute";
import PatientProfile from "../modules/patient/PatientProfile";
import DoctorRegistration from "../modules/Doctor/DoctorRegistration"
const PatientRouts = () => {
  return (
    <Routes>
      <Route path={PATIENTROUTES.SELECTHOSPITAL}  element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <SelectHospital />
          </ProtectedRoute>
        }/>

         <Route path={PATIENTROUTES.PATIENTPROFILE}  element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientProfile/>
          </ProtectedRoute>
        }/>

        <Route path={PATIENTROUTES.DOCTORREGISTRACTIONFORM} element={<ProtectedRoute allowedRoles={["patient"]}>
          <DoctorRegistration/>
        </ProtectedRoute>}/>
    </Routes>
  )
}

export default PatientRouts