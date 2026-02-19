import React, { useEffect, useState } from 'react';
import {  Eye, EyeOff } from 'lucide-react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import axios from 'axios';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, role } = location.state || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
   useEffect(() => {
    const reset = localStorage.getItem("resetpassword");
    if (!reset) {
      navigate("/");
    }
  }, [navigate]);
  if (!email) return <Navigate to="/forgot-password" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     console.log(role,"      inshad")
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        email,
        password: password,
        role:role
      });

      toast.success('Password reset successfully!');
       localStorage.removeItem('resetpassword');
      navigate(`/login/${role || 'patient'}`);
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred';
      if (axios.isAxiosError(error)) {
    errorMessage = error.response?.data?.message || error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
    toast.error(`reset password failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Set New Password</h2>
        <p className="text-gray-600 mb-6">Resetting password for {email}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;