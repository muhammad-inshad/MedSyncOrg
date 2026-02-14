import { Routes, Route } from "react-router-dom";
import { COMMON_ROUTES } from "@/constants/frontend/common/common.routes";
import AdminReviewPending from "@/modules/shared/AdminReviewPending";
import AdminProtectedRoute from "./CommonProtector";
import EditHospital from "@/modules/superAdmin/components/EditHospital";

const CommonRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminProtectedRoute />}>
        <Route path={COMMON_ROUTES.REVIEWPENDING} element={<AdminReviewPending />} />
        <Route path={COMMON_ROUTES.ADMINEDITPROFILE} element={<EditHospital />} />
      </Route>
    </Routes>
  );
};

export default CommonRoutes;