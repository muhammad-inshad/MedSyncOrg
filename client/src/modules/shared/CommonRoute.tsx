import { Routes, Route } from "react-router-dom";
import { COMMON_ROUTES } from "@/constants/frontend/common/common.routes";
import AdminReviewPending from "@/modules/shared/AdminReviewPending";
import AdminProtectedRoute from "./CommonProtector";
import EditHospital from "./hospital/Hospital_edit";
import { HOSPITAL_ROUTES } from "@/constants/frontend/hospital/hospital.routes";
import { DOCTOR_ROUTES } from "@/constants/frontend/doctor/doctor.routes";
import Doctor_edit from "./doctor/Doctor_edit";

const CommonRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminProtectedRoute />}>
        <Route path={COMMON_ROUTES.REVIEWPENDING} element={<AdminReviewPending />} />
        <Route path={DOCTOR_ROUTES.DOCTOREDITFORREVIEW} element={<Doctor_edit />} />
        <Route path={HOSPITAL_ROUTES.HOSPITALEDITFORREVIEW} element={<EditHospital />} />
      </Route>
    </Routes>
  );
};

export default CommonRoutes;