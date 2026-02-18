import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import api from '../../../lib/api'
import logo from '../../../assets/images/logo.png'
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../store/auth/authSlice';
import axios from 'axios';
import { COMMON_ROUTES } from "@/constants/frontend/common/common.routes";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";
import { SUPERADMIN_ROUTES } from "@/constants/frontend/superAdmin/superAdmin.routes";

const LogInSchema = z.object({
  email: z.string().min(1, 'Username or email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LogInFormData = z.infer<typeof LogInSchema>;

const ROLE_CONFIG: Record<string, { title: string; redirect: string }> = {
  doctor: {
    title: "Doctor Login",
    redirect: COMMON_ROUTES.REVIEWPENDING,
  },
  patient: {
    title: "Patient Login",
    redirect: PATIENT_ROUTES.SELECTHOSPITAL,
  },
  admin: {
    title: "Admin Login",
    redirect: COMMON_ROUTES.REVIEWPENDING,
  },
  Superadmin: {
    title: "Super Admin Login",
    redirect: SUPERADMIN_ROUTES.DASHBOARD,
  },
};

const LogIn = () => {
  const { role = "patient" } = useParams();
  const roleConfig = ROLE_CONFIG[role];
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const [blockedError, setBlockedError] = useState<string | null>(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const isSuperAdmin = role.toLowerCase() === "superadmin"
  const isPatient = role === "patient"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LogInFormData>({
    resolver: zodResolver(LogInSchema),
  });

  const dispatch = useDispatch();
  useEffect(() => {
    if (location.state?.blockedMessage) {
      setBlockedError(location.state.blockedMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  const onSubmit = async (data: LogInFormData) => {
    setIsLoading(true);
    setBlockedError(null);
    try {
      let endpoint = '';
      if (role === 'Superadmin') endpoint = '/api/auth/Superadmin/login';
      else if (role === 'doctor') endpoint = '/api/auth/doctor/login';
      else if (role === 'admin') endpoint = '/api/auth/admin/login';
      else endpoint = '/api/auth/login';

      const response = await api.post(endpoint, { ...data, role });
      const resData = response.data;

      if (resData.success) {
        const user = resData.data?.user;

        if (user?.isActive === false) {
          setBlockedError("Your account is currently blocked. Please contact the hospital admin.");
          setIsLoading(false);
          return;
        }

        dispatch(loginSuccess({
          user,
          profileData: resData.data,
        }));

        localStorage.setItem("role", role);
        if (resData.data?.accessToken) localStorage.setItem("accessToken", resData.data.accessToken);
        if (resData.data?.refreshToken) localStorage.setItem("refreshToken", resData.data.refreshToken);

        toast.success("Login successful");
        navigate(roleConfig.redirect);
      } else {
        toast.error(resData.message || "Login failed");
      }
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }

  };

  const handleGoogleLogIn = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google?role=${role}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">

      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="mb-1 flex justify-center">
            <img src={logo} alt="Logo" className="w-40 h-auto" />
          </div>
          {blockedError && (
            <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm font-semibold mb-6 text-center animate-pulse">
              {blockedError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">

              Email
            </label>
            <input
              {...register('email')}
              type="text"
              placeholder="example@gmail.com"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Your Password"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 ${errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {!isSuperAdmin && (
            <div className="flex justify-center gap-8 text-sm">
              <button type="button" onClick={() => navigate(`/forgot-password?role=${role}`)} className="text-red-500 hover:underline">
                Forgot Password?
              </button>

            </div>
          )}

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
        {isPatient && (
          <>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">Or With</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <button
              onClick={handleGoogleLogIn}
              className="w-full bg-white border border-gray-300 py-3 rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Login with Google
            </button>
          </>
        )}
        {isPatient &&
          <div className="text-center mt-8 text-sm text-gray-600">
            Don't have an account?{' '}
            <button onClick={() => navigate(`/${role}/signup`)} className="text-blue-600 hover:underline font-medium">
              Sign Up
            </button>
          </div>}
      </div>
    </div>
  );
};

export default LogIn;