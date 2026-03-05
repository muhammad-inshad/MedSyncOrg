
import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/constants/backend/auth/auth.api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AUTH_MESSAGES } from '@/constants/frontend/auth/auth.messages';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const role = searchParams.get('role') || 'patient';

  const handleEmailSubmit = async () => {
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error(AUTH_MESSAGES.FORGOT_PASSWORD.INVALID_EMAIL);
      setLoading(false);
      return;
    }

    try {
      console.log(role)
      await authApi.sendOtp({
        email: email.trim(),
        role: role as "doctor" | "patient" | "hospital",
        purpose: 'forgot-password',
      });

      toast.success(AUTH_MESSAGES.COMMON.OTP_SENT);
      localStorage.setItem('otpPageAllowed', 'true');

      const expirationTime = Date.now() + 60 * 1000;
      localStorage.setItem('otpExpirationTime', expirationTime.toString());

      navigate(`/otp?role=${role}`, {
        replace: true,
        state: {
          signupData: { email: email.trim() },
          purpose: 'forgot-password',
          role,
          from: 'forgot-password'
        },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || AUTH_MESSAGES.FORGOT_PASSWORD.SEND_BUTTON);
      } else {
        toast.error(AUTH_MESSAGES.COMMON.UNEXPECTED_ERROR);
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEmailSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {AUTH_MESSAGES.FORGOT_PASSWORD.TITLE}
          </h2>
          <p className="text-gray-600 mt-2">
            {AUTH_MESSAGES.FORGOT_PASSWORD.SUBTITLE} ({role.charAt(0).toUpperCase() + role.slice(1)})
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {AUTH_MESSAGES.FORGOT_PASSWORD.EMAIL_LABEL}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder={AUTH_MESSAGES.FORGOT_PASSWORD.EMAIL_PLACEHOLDER}
              disabled={loading}
            />
          </div>
        </div>

        <button
          onClick={handleEmailSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {loading ? AUTH_MESSAGES.FORGOT_PASSWORD.SENDING : AUTH_MESSAGES.FORGOT_PASSWORD.SEND_BUTTON}
        </button>

        <div className="mt-6 text-center">
          <a href={`/login/${role}`} className="text-sm text-indigo-600 hover:underline">
            {AUTH_MESSAGES.COMMON.BACK_TO_LOGIN}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;