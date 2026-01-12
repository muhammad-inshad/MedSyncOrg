import { Routes, Route } from "react-router-dom";
import { COMMON } from "@/constants/routes/routes";
import AdminReviewPending from "@/modules/shared/AdminReviewPending";
import ProtectedRoute from "../../routes/ProtectedRoute";

const CommonRoutes = () => {
  return (
    <Routes>
      <Route
        path={COMMON.REVIEWPENDING}
        element={
          <ProtectedRoute allowedRoles={["admin", "doctor"]}>
            <AdminReviewPending />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default CommonRoutes;
