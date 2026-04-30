import { useState, useEffect, useCallback } from 'react';
import { Search, Bell, Settings, User, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

import { doctorApi } from '@/constants/backend/doctor/doctor.api';
import DoctorDashbord from '../../../assets/images/DoctorDashbord.png';
import { Link, useNavigate } from 'react-router-dom';
import { DOCTOR_ROUTES } from '@/constants/frontend/doctor/doctor.routes';
import DoctorSidebar from '../components/DoctorSidebar';
import SalaryHikeRequestModal from '../components/SalaryHikeRequestModal';


interface SalaryHikeStatus {
  _id: string;
  status: string;
  requestedAmount: number;
  approvedAmount?: number;
  approvalNote?: string;
  rejectionReason?: string;
  createdAt: string;
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [latestRequest, setLatestRequest] = useState<SalaryHikeStatus | null>(null);
  const [isFetchingStatus, setIsFetchingStatus] = useState(true);

  const { user } = useSelector((state: RootState) => state.auth);
  const doctorId = user?.id;

  const fetchSalaryStatus = useCallback(async () => {
    if (!doctorId) {
      console.log("No doctorId available, skipping fetch");
      return;
    }
    try {
      setIsFetchingStatus(true);
      const res = await doctorApi.getSalaryIncreaseRequest(doctorId);
      if (res.data?.success) {
        console.log("Fetched salary status:", res.data.data);
        setLatestRequest(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch salary status:', error);
    } finally {
      setIsFetchingStatus(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchSalaryStatus();
  }, [fetchSalaryStatus]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'APPROVED': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'REJECTED': return 'bg-rose-50 border-rose-200 text-rose-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'APPROVED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <TrendingUp className="w-5 h-5 text-gray-500" />;
    }
  };
 
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ── */}
      <DoctorSidebar />

      {/* ── Page body ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Brand + nav (nav links are now in sidebar; keep brand for context) */}
              <div className="flex items-center space-x-8">
                <nav className="hidden md:flex space-x-8">
                  <Link to={DOCTOR_ROUTES.DOCTORDASHBOARD} className="text-gray-900 font-medium">Home</Link>
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button onClick={() => setShowSalaryModal(true)} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Start Consultation
                </button>
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
                <Settings className="w-6 h-6 text-gray-600 cursor-pointer" />
                <div
                  onClick={() => navigate(DOCTOR_ROUTES.DOCTORPROFILE)}
                  className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors"
                >
                  <User className="w-6 h-6 text-gray-600" />
                </div>
               
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div
            className="rounded-xl overflow-hidden mb-8 relative bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${DoctorDashbord})` }}
          >
            <div className="absolute inset-0 bg-black opacity-10" />
            <div className="relative px-8 py-16">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Doctor Dashboard</h1>
              <p className="text-gray-700 mb-6 max-w-md">
                Welcome back, Dr. {user?.name?.split(' ').pop() || 'Doctor'}. Manage your appointments, patients, and earnings all in one place.
              </p>
              <div className="flex space-x-4">
                <button className="px-6 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition">
                  Manage Appointments
                </button>
                <button className="px-6 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition">
                  Apply for Leave
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">            {/* Right Column */}
            <div className="space-y-6">
              {/* Salary Hike Status Updates */}
              {!isFetchingStatus && latestRequest && (
                <div className={`rounded-2xl border p-6 space-y-4 shadow-sm transition-all duration-300 ${getStatusColor(latestRequest.status)}`}>
                  <div className="flex items-center justify-between border-b border-black/5 pb-3">
                    <div className="flex items-center gap-2.5 font-bold uppercase tracking-wider text-xs">
                      {getStatusIcon(latestRequest.status)}
                      {latestRequest.status === 'PENDING' ? 'Request Under Review' : `Request ${latestRequest.status}`}
                    </div>
                    <span className="text-[10px] font-medium opacity-60 uppercase tracking-tighter">
                      {new Date(latestRequest.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-70 font-medium">Requested Hike:</span>
                      <span className="font-bold tabular-nums">₹{latestRequest.requestedAmount?.toLocaleString()}</span>
                    </div>
                    
                    {latestRequest.status === 'APPROVED' && latestRequest.approvedAmount && (
                      <div className="flex justify-between items-center text-sm p-2.5 bg-white/40 rounded-xl">
                        <span className="text-emerald-900/70 font-semibold italic">Final Approved:</span>
                        <span className="font-black text-emerald-800 tabular-nums">₹{latestRequest.approvedAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {(latestRequest.approvalNote || latestRequest.rejectionReason) && (
                      <div className="p-4 bg-white/50 rounded-xl text-xs leading-relaxed text-slate-700 italic border border-white/40 shadow-inner">
                        <span className="font-bold not-italic flex items-center gap-1.5 mb-1.5 text-[10px] uppercase tracking-wider opacity-70">
                          {latestRequest.status === 'REJECTED' ? (
                            <>
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                              Reason for Rejection:
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              Note from Management:
                            </>
                          )}
                        </span>
                        <p className="pl-4.5 border-l-2 border-black/5 ml-0.5">
                          "{latestRequest.status === 'REJECTED' ? latestRequest.rejectionReason : latestRequest.approvalNote}"
                        </p>
                      </div>
                    )}
                  </div>

                  {latestRequest.status === 'REJECTED' && (
                    <button
                      onClick={() => setShowSalaryModal(true)}
                      className="w-full py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <TrendingUp className="w-4 h-4" /> Re-request Salary Hike
                    </button>
                  )}
                </div>
              )}

              {/* Main Request Button (only shows when no pending/rejected request exists) */}
              {(!latestRequest || latestRequest.status === 'APPROVED') && (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-600/20 p-8 text-center border border-blue-400/20">
                  <div className="mb-4 bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Grow Your Earnings</h3>
                  <p className="text-blue-100 text-xs mb-6 leading-relaxed">Submit a request for a salary increment based on your performance.</p>
                  <button 
                    onClick={() => setShowSalaryModal(true)}  
                    className="w-full py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold text-sm uppercase tracking-widest shadow-lg active:scale-[0.98]"
                  >
                    Request Salary Hike
                  </button>
                </div>
              )}

              {latestRequest?.status === 'PENDING' && (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-slate-100 flex flex-col items-center">
                   <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                     <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
                   </div>
                   <h3 className="font-bold text-slate-800 text-lg">Processing Request</h3>
                   <p className="text-slate-500 text-sm mt-2 max-w-[200px]">The management is currently reviewing your application.</p>
                </div>
              )}

              <SalaryHikeRequestModal
                isOpen={showSalaryModal}
                onClose={() => {
                  setShowSalaryModal(false);
                  fetchSalaryStatus();
                }}
              />
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default DoctorDashboard;