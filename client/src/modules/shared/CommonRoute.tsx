import { Routes, Route } from "react-router-dom";
import { COMMON } from "@/constants/routes/routes";
import AdminReviewPending from "@/modules/shared/AdminReviewPending";
import AdminProtectedRoute from "../doctor/routes/AdminProtectedRoute"; 

const CommonRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminProtectedRoute />}>
        <Route path={COMMON.REVIEWPENDING} element={<AdminReviewPending />} />
      </Route>
    </Routes>
  );
};

export default CommonRoutes;