import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { PATIENT_ROUTES } from '@/constants/frontend/patient/patient.routes';
import axios from 'axios';

const OtpPage = () => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const [timer, setTimer] = useState(0);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get('role');
  const signupData = location.state?.signupData;
  const purpose = location.state?.purpose;

  const handleConfirm = async () => {
    if (isTimerExpired) {
      toast.error('OTP has expired! Please resend OTP.');
      return;
    }

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    try {
      const response = await api.post('/api/auth/verify-otp', {
        otp: otpValue,
        signupData,
      });

      if (response.data.success) {
        if (purpose) {
          toast.success('OTP Verified! Please set your new password.');
          localStorage.removeItem('otpPageAllowed');
          localStorage.removeItem('otpExpirationTime');
          localStorage.setItem("resetpassword", "true");
          navigate('/reset-password', {
            state: { email: signupData.email, role },
          });
        } else if (role === 'patient' || role === 'admin') {
          const result = await api.post('/api/auth/signup', signupData);
          localStorage.removeItem('otpPageAllowed');
          localStorage.removeItem('otpExpirationTime');
          if (result.data.success) {
            toast.success('Account created successfully!');
            navigate(`/login/${role}`, { replace: true });
          } else {
            toast.error(result.data.message || 'Failed to create account');
          }
        } else {
          toast.error('Unknown role');
        }
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
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
      await api.post('/api/auth/send-otp', {
        email: signupData.email,
        purpose: purpose || 'signup'
      });

      setOtp(['', '', '', '', '', '']);
      setOtp(['', '', '', '', '', '']);

      const newExpiration = Date.now() + 60 * 1000;
      localStorage.setItem('otpExpirationTime', newExpiration.toString());
      setTimer(60);

      setIsTimerExpired(false);
      inputRefs.current[0]?.focus();
      toast.success('OTP resent successfully!');
    } catch (error: unknown) {
      console.error(error);
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsTimerExpired(true);
            toast.error('OTP has expired! Please click Resend OTP.');
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
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Enter OTP</h2>
        <p className="text-gray-600 text-sm mb-8">
          We sent an OTP to <strong>{signupData.email}</strong>. Please enter the code to verify your account.
        </p>

        <div className="mb-6">
          <p className={`text-lg font-semibold ${isTimerExpired ? 'text-red-600' : 'text-blue-600'}`}>
            {isTimerExpired ? 'OTP Expired' : `Time remaining: ${formatTime(timer)}`}
          </p>
          {isTimerExpired && (
            <p className="text-red-500 text-sm mt-2">
              Please click "Resend OTP" to receive a new code
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
              disabled={isTimerExpired}
              className={`w-14 h-14 text-center text-2xl font-medium border-2 rounded-xl focus:outline-none bg-gray-50 transition-all ${isTimerExpired
                ? 'border-red-300 bg-red-50 cursor-not-allowed opacity-60'
                : 'border-gray-300 focus:border-blue-600'
                }`}
              placeholder="0"
            />
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={isTimerExpired}
          className={`w-full max-w-xs mx-auto block font-medium py-3.5 rounded-full mb-4 shadow-md transition-all ${isTimerExpired
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          Confirm
        </button>

        <button
          onClick={handleResend}
          disabled={!isTimerExpired}
          className={`w-full max-w-xs mx-auto block font-medium py-3.5 rounded-full transition-all shadow-md ${!isTimerExpired
            ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
        >
          {!isTimerExpired ? `Resend in ${formatTime(timer)}` : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
};

export default OtpPage;