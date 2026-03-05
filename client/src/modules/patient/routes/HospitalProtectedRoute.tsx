import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loadHospitalData } from "@/store/selectedHospital/authThunk";
import toast from "react-hot-toast";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";

const HospitalProtectedRoute = () => {
  const dispatch = useAppDispatch();

  const hospital = useAppSelector((state) => state.hospital.hospital);

  const hospitalId = sessionStorage.getItem("hospitalId");

  useEffect(() => {
    if (hospitalId && !hospital) {
      dispatch(loadHospitalData(hospitalId));
    }
  }, [hospitalId, hospital, dispatch]);

  if (!hospitalId) {
    toast.error("please select a hospital")
    return <Navigate to={PATIENT_ROUTES.SELECTHOSPITAL} replace />;
  }

  return <Outlet />;
};

export default HospitalProtectedRoute;