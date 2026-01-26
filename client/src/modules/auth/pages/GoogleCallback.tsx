import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../store/auth/authSlice';
import { PATIENTROUTES, SUPERADMINROUTES, COMMON } from "@/constants/routes/routes";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // We don't get 'token' from URL anymore because it's in an HTTP-only Cookie
    const userJson = searchParams.get('user');
    const role = searchParams.get('role') || 'patient';

    if (userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));

        // 1. Update Redux (This tells the app the user is authenticated)
        dispatch(loginSuccess({ 
          user, 
          profileData: user 
        }));

        // 2. Store role for persistence
        localStorage.setItem("role", role);

        // 3. Define Redirect Logic (Matching your ROLE_CONFIG)
        let redirectPath = '/';
        if (role === 'doctor') redirectPath = COMMON.REVIEWPENDING;
        else if (role === 'patient') redirectPath = PATIENTROUTES.SELECTHOSPITAL;
        else if (role === 'admin') redirectPath = COMMON.REVIEWPENDING;
        else if (role === 'Superadmin') redirectPath = SUPERADMINROUTES.DASHBOARD;

        navigate(redirectPath);
      } catch (error) {
        console.error("Error parsing Google user data", error);
        navigate('/login');
      }
    } else {
      // If no user data is found in URL, something went wrong
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