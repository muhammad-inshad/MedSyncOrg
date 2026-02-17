import React from 'react';
import { Clock, AlertCircle, RefreshCcw, LogOut, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/hooks/redux';
import { logout } from '@/store/auth/authSlice';
import type { RootState } from '@/store/store';
import type { IAdmin } from '@/interfaces/IAdmin';
import { DOCTOR_ROUTES } from '@/constants/frontend/doctor/doctor.routes';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { initializeAuth } from '@/store/auth/authThunks';

import type { BaseUser, ProfileData } from '@/store/auth/auth.type';
import { ADMIN_ROUTES } from '@/constants/frontend/admin/admin.routes';

interface InitializeAuthPayload {
  user: BaseUser;
  profileData: ProfileData;
}

const AdminReviewPending: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = localStorage.getItem("role");

  const userData = (user as (BaseUser & { _doc?: BaseUser }))?._doc ?? user;

  const status = userData?.reviewStatus;
  console.log(status)
  const rejectionReason = userData?.rejectionReason;

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("role");
    navigate('/');
  };

  const handleEdit = async (hospital: IAdmin) => {
    const role = localStorage.getItem("role");
    if (!role) return;

    const resultAction = await dispatch(initializeAuth(role));

    if (initializeAuth.fulfilled.match(resultAction)) {
      const payload = resultAction.payload as InitializeAuthPayload;
      const freshUser = payload.user as (BaseUser & { _doc?: BaseUser });
      const freshStatus = freshUser?._doc?.reviewStatus ?? freshUser?.reviewStatus;

      console.log("Current role:", role, "Fresh status:", freshStatus);

      if (freshStatus === 'revision') {
        const destination = role === 'doctor' ? DOCTOR_ROUTES.DOCTOREDITPROFILE : ADMIN_ROUTES.ADMINEDIT;
        navigate(destination, {
          state: { hospital, fromReview: true }
        });
      } else {
        toast.error("You can only edit details when a revision is requested.");
        window.location.reload();
      }
    } else {
      toast.error("Failed to refresh user status. Please try again.");
    }
  };


  const handleReapply = async (id: string) => {
    try {
      if (userRole === "doctor") {
        await api.patch(`/api/doctor/reapply/${id}`);
      } else {
        await api.patch(`/api/admin/reapply/${id}`);
      }
      toast.success("Re-application submitted successfully");
      window.location.reload();
    } catch (error: unknown) {
      console.error("Reapply failed:", error);
      toast.error("Failed to re-apply. Please try again.");
    }
  };

  const isDoctor = userRole === 'doctor';

  const isRejected = status === 'rejected';
  const isRevision = status === 'revision';
  const isPending = status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative">
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors font-medium"
      >
        <LogOut className="w-5 h-5" /> Logout
      </button>

      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className={`w-32 h-32 ${isRejected || isRevision ? 'bg-red-50' : 'bg-blue-50'} rounded-full flex items-center justify-center`}>
                <div className={`w-16 h-20 ${isRejected || isRevision ? 'bg-red-500' : 'bg-blue-600'} rounded-lg shadow-inner flex items-center justify-center`}>
                  {isDoctor ? <User className="text-white w-10 h-10" /> : null}
                </div>
              </div>
              <div className={`absolute top-2 right-2 w-9 h-9 ${isRejected || isRevision ? 'bg-red-600' : 'bg-orange-500'} rounded-full border-4 border-white flex items-center justify-center shadow-lg text-white`}>
                {isRejected || isRevision ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRejected ? 'Application Rejected' : isRevision ? 'Revision Required' : 'Review in Progress'}
          </h1>

          <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
            {isPending
              ? isDoctor
                ? 'The hospital administration is currently verifying your medical credentials. This usually takes 24-48 hours.'
                : 'Our admin team is currently verifying your documents. This usually takes 24-48 hours.'
              : 'Action is required based on the administrator’s feedback below.'}
          </p>

          {(isRejected || isRevision) && (
            <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-left shadow-sm animate-in fade-in duration-500">
              <h4 className="text-red-800 font-bold flex items-center gap-2 mb-2 text-lg">
                <AlertCircle className="w-5 h-5" /> Admin Feedback
              </h4>
              <div className="bg-white/70 p-4 rounded-lg border border-red-100 italic text-gray-800">
                "{rejectionReason || (isDoctor ? 'Please verify your medical credentials and license information.' : 'Please verify your medical license and hospital registration documents.')}"
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isRejected && userData?._id && (
              <button
                onClick={() => handleReapply(userData._id)}
                className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <RefreshCcw className="w-5 h-5" /> Reapply Now
              </button>
            )}

            {isRevision && userData && (
              <button
                onClick={() => handleEdit(userData as unknown as IAdmin)}
                className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <ArrowRight className="w-5 h-5" /> Update Details
              </button>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
            >
              <RefreshCcw className="w-5 h-5" /> Refresh Status
            </button>


            <button className="px-8 py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewPending;