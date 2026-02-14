import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../store/auth/authSlice';
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const userJson = searchParams.get('user');
    const role = searchParams.get('role') || 'patient';

    if (userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        dispatch(loginSuccess({
          user,
          profileData: user
        }));

        localStorage.setItem("role", role);
        let redirectPath = '/';
         if (role === 'patient') redirectPath = PATIENT_ROUTES.SELECTHOSPITAL;
        navigate(redirectPath);
      } catch (error) {
        console.error("Error parsing Google user data", error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600 font-medium">Completing your login...</p>
    </div>
  );
};

export default GoogleCallback;