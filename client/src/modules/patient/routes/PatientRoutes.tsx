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
import AppointmentHistory from "../pages/AppointmentHistory";
import Livetoken from "../pages/Livetoken";
import PaymentSuccess from "../../shared/pages/PaymentSuccess";
import PaymentFailed from "../../shared/pages/PaymentFailed";
import { patientApi } from "@/constants/backend/patient/patient.api";
import Prescriptions from "../pages/Prescriptions";
import PatientWallet from "../pages/PatientWallet";


const PatientRouts = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
        <Route path={PATIENT_ROUTES.SELECTHOSPITAL} element={<SelectHospital />} />
        <Route path={PATIENT_ROUTES.PATIENTPROFILE} element={<PatientProfile />} />
        <Route path={PATIENT_ROUTES.VIEW_APPOIMENTS_HISTORY} element={<AppointmentHistory />} />
        <Route path={PATIENT_ROUTES.PATIENTEDIT} element={<EditPatientProfile />} />
        <Route path={PATIENT_ROUTES.LIVETOKEN} element={<Livetoken/>}/>
        <Route path={PATIENT_ROUTES.PRISCRIPTION} element={<Prescriptions/>}/>
        <Route path={PATIENT_ROUTES.WALLET} element={<PatientWallet/>}/>
        <Route path={PATIENT_ROUTES.PAYMENT_SUCCESS} element={
          <PaymentSuccess 
            redirectPath={PATIENT_ROUTES.PATIENTPROFILE}
            redirectLabel="Go to Profile"
            pollingFunc={patientApi.checkAppointmentStatus}
            successMessage="Appointment confirmed!"
            message="Your appointment has been successfully recorded."
            failureRedirectPath={PATIENT_ROUTES.PAYMENT_FAILED}
          />
        }/>
        <Route path={PATIENT_ROUTES.PAYMENT_FAILED} element={
          <PaymentFailed 
            redirectPath={PATIENT_ROUTES.PATIENTPROFILE}
            redirectLabel="Back to Profile"
          />
        }/>
        <Route element={<HospitalProtectedRoute />}>
          <Route path={PATIENT_ROUTES.HOSPITAL_HOMEPAGE} element={<PatientHospitalHome />} />
          <Route path={PATIENT_ROUTES.HOSPITAL_DOCTOR} element={<PatientDoctor />} />
          <Route path={PATIENT_ROUTES.PATIENT_APPOIMENT} element={<PatientAppointment />} />
          <Route path={PATIENT_ROUTES.HOSPITAL_DEPaRTMENTS} element={<HospitalDepartments />} />
          <Route path={PATIENT_ROUTES.DOCTOR_PROFILE} element={<DoctorProfile />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default PatientRouts;