import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../../../constants/backend/auth/auth.api';
import toast from 'react-hot-toast';
import { PATIENT_ROUTES } from '@/constants/frontend/patient/patient.routes';
import axios from 'axios';
import { AUTH_MESSAGES } from '@/constants/frontend/auth/auth.messages';

const OtpPage = () => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const [timer, setTimer] = useState(0);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isConfirming = useRef(false);
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get('role');
  const signupData = location.state?.signupData;
  const purpose = location.state?.purpose;

  const handleConfirm = async () => {
    if (isTimerExpired || isLoading || isConfirming.current) {
      if (isTimerExpired) toast.error(AUTH_MESSAGES.COMMON.OTP_EXPIRED);
      return;
    }

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error(AUTH_MESSAGES.OTP.ENTER_ALL_DIGITS);
      return;
    }

    try {
      setIsLoading(true);
      isConfirming.current = true;
      const response = await authApi.verifyOtp({
        otp: otpValue,
        signupData,
      });

      if (response.data.success) {
        if (purpose) {
          toast.success(AUTH_MESSAGES.OTP.VERIFY_SUCCESS);
          localStorage.removeItem('otpPageAllowed');
          localStorage.removeItem('otpExpirationTime');
          localStorage.setItem("resetpassword", "true");
          navigate('/reset-password', {
            state: { email: signupData.email, role },
          });
        } else if (role === 'patient' || role === 'hospital') {
          const result = await authApi.signup(signupData);
          localStorage.removeItem('otpPageAllowed');
          localStorage.removeItem('otpExpirationTime');
          if (result.data.success) {
            toast.success(AUTH_MESSAGES.SIGNUP.SUCCESS);
            navigate(`/login/${role}`, { replace: true });
          } else {
            toast.error(result.data.message || AUTH_MESSAGES.SIGNUP.FAILED);
          }
        } else {
          toast.error(AUTH_MESSAGES.OTP.UNKNOWN_ROLE);
        }
      } else {
        toast.error(AUTH_MESSAGES.COMMON.INVALID_OTP);
      }
    } catch (error: unknown) {
      let errorMessage = AUTH_MESSAGES.COMMON.UNEXPECTED_ERROR;
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      isConfirming.current = false;
    }
  };

  useEffect(() => {
    const isAllowed = localStorage.getItem('otpPageAllowed');
    const storedExpiration = localStorage.getItem('otpExpirationTime');

    if (!isAllowed || !location.state?.signupData) {
      // Clear potentially stale state
      localStorage.removeItem('otpPageAllowed');
      localStorage.removeItem('otpExpirationTime');
      navigate(PATIENT_ROUTES.LOGIN, { replace: true });
      return;
    }

    if (storedExpiration) {
      const expirationTime = parseInt(storedExpiration, 10);
      const now = Date.now();
      const remainingTime = Math.max(0, Math.floor((expirationTime - now) / 1000));

      setTimer(remainingTime);
      if (remainingTime === 0) {
        setIsTimerExpired(true);
      }
    } else {
      setTimer(60);
    }
  }, [navigate, location.state]);

  const handleResend = async () => {
    try {
      await authApi.sendOtp({
        email: signupData.email,
        role: role as "doctor" | "patient" | "hospital",
        purpose: purpose || 'signup'
      });

      setOtp(['', '', '', '', '', '']);
      setOtp(['', '', '', '', '', '']);

      const newExpiration = Date.now() + 60 * 1000;
      localStorage.setItem('otpExpirationTime', newExpiration.toString());
      setTimer(60);

      setIsTimerExpired(false);
      inputRefs.current[0]?.focus();
      toast.success(AUTH_MESSAGES.COMMON.RESEND_SUCCESS);
    } catch (error: unknown) {
      console.error(error);
      toast.error(AUTH_MESSAGES.COMMON.RESEND_FAILED);
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsTimerExpired(true);
            toast.error(AUTH_MESSAGES.COMMON.OTP_EXPIRED_CLICK_RESEND);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (otp.join('').length === 6 && !isTimerExpired) {
      handleConfirm();
    }
  }, [otp, isTimerExpired]);

  if (!signupData) {
    return <Navigate to={PATIENT_ROUTES.SIGNUP} replace />;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (isTimerExpired) return;
    if (value && isNaN(Number(value))) return;

    const newValue = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = newValue;
    setOtp(newOtp);

    if (newValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isTimerExpired) return;
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isTimerExpired) {
      e.target.blur();
      return;
    }
    e.target.select();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (isTimerExpired) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);

    const nextFocusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[nextFocusIndex]?.focus();
    inputRefs.current[nextFocusIndex]?.select();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-16 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600">MedSync</h1>
      </div>

      <div className="w-full max-w-md text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{AUTH_MESSAGES.OTP.TITLE}</h2>
        <p className="text-gray-600 text-sm mb-8">
          {AUTH_MESSAGES.OTP.SUBTITLE} <strong>{signupData.email}</strong>{AUTH_MESSAGES.OTP.SUBTITLE_CONTINUE}
        </p>

        <div className="mb-6">
          <p className={`text-lg font-semibold ${isTimerExpired ? 'text-red-600' : 'text-blue-600'}`}>
            {isTimerExpired ? AUTH_MESSAGES.OTP.EXPIRED_TITLE : `${AUTH_MESSAGES.OTP.TIME_REMAINING} ${formatTime(timer)}`}
          </p>
          {isTimerExpired && (
            <p className="text-red-500 text-sm mt-2">
              {AUTH_MESSAGES.OTP.EXPIRED_HINT}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              // Alternative short syntax (also correct):
              // ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={handleFocus}
              {...(index === 0 ? { onPaste: handlePaste } : {})}
              disabled={isTimerExpired || isLoading}
              className={`w-14 h-14 text-center text-2xl font-medium border-2 rounded-xl focus:outline-none bg-gray-50 transition-all ${isTimerExpired || isLoading
                ? 'border-red-300 bg-red-50 cursor-not-allowed opacity-60'
                : 'border-gray-300 focus:border-blue-600'
                }`}
              placeholder="0"
            />
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={isTimerExpired || isLoading}
          className={`w-full max-w-xs mx-auto block font-medium py-3.5 rounded-full mb-4 shadow-md transition-all ${isTimerExpired || isLoading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          {isLoading ? AUTH_MESSAGES.OTP.VERIFYING_BUTTON : AUTH_MESSAGES.OTP.CONFIRM_BUTTON}
        </button>

        <button
          onClick={handleResend}
          disabled={!isTimerExpired}
          className={`w-full max-w-xs mx-auto block font-medium py-3.5 rounded-full transition-all shadow-md ${!isTimerExpired
            ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
        >
          {!isTimerExpired ? `${AUTH_MESSAGES.OTP.RESEND_IN} ${formatTime(timer)}` : AUTH_MESSAGES.OTP.RESEND_BUTTON}
        </button>
      </div>
    </div>
  );
};

export default OtpPage;