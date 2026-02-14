
import { Phone, Bot } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { logout } from '@/store/auth/authSlice';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import avathar from '../../../assets/images/avatar.png';
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";
import api from '@/lib/api';
import { toast } from "react-hot-toast";

const PatientProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, profileData } = useAppSelector((state) => state.auth);

  const patient = profileData || user;

  if (!patient) {
    return <Navigate to="/" replace />;
  }

const Editpatient = () => {
   navigate(PATIENT_ROUTES.PATIENTEDIT);
};

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      dispatch(logout());
      localStorage.removeItem("role");
      toast.success("Logged out successfully!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logout());
      toast.error("Session cleared");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className=" mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Profile Card */}
          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold">{patient.name || 'Patient'}</h2>
              <div className="w-28 h-28 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={patient.image || avathar}
                  alt={patient.name || 'profile'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = avathar;
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {patient.age && (
                <div className="flex justify-between py-2 border-b border-blue-400">
                  <span className="text-blue-100 text-sm">Age</span>
                  <span className="font-semibold">{patient.age}</span>
                </div>
              )}

              {patient.fatherName && (
                <div className="flex justify-between py-2 border-b border-blue-400">
                  <span className="text-blue-100 text-sm">Father's Name</span>
                  <span className="font-semibold">{patient.fatherName}</span>
                </div>
              )}

              {patient.bloodGroup && patient.bloodGroup !== 'Unknown' && (
                <div className="flex justify-between py-2 border-b border-blue-400">
                  <span className="text-blue-100 text-sm">Blood Group</span>
                  <span className="font-semibold">{patient.bloodGroup}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-blue-400">
                <span className="text-blue-100 text-sm">Gender</span>
                <span className="font-semibold capitalize">{patient.gender || 'Not set'}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-blue-400">
                <span className="text-blue-100 text-sm">Phone</span>
                <span className="font-semibold">{patient.phone}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-blue-400">
                <span className="text-blue-100 text-sm">Email</span>
                <span className="font-semibold text-sm break-all">{patient.email}</span>
              </div>

              {patient.address && (
                <div className="py-2">
                  <span className="text-blue-100 text-sm block mb-1">Address</span>
                  <span className="font-semibold text-sm">{patient.address}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-blue-400">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <div>
                  <div className="text-sm text-blue-100">Emergency Contact</div>
                  <div className="text-lg font-bold">(237) 681-812-255</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Action Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Apply for Doctor */}
            <div className="bg-blue-50 rounded-xl p-5 shadow-sm h-fit">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800">Apply for Doctor</h3>
              </div>
              <button
                onClick={() => navigate(PATIENT_ROUTES.DOCTORREGISTRACTIONFORM)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Apply Now
              </button>
            </div>

            {/* Live Token */}
            <div className="bg-teal-50 rounded-xl p-5 shadow-sm h-fit">
              {/* ... same structure ... */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800">Live Token</h3>
              </div>
              <button className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                Get Token
              </button>
            </div>

            {/* Chat */}
            <div className="bg-green-50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800">Chat</h3>
              </div>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                Start Chat
              </button>
            </div>

            {/* Edit Profile */}
            <div className="bg-indigo-50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800">Edit Profile</h3>
              </div>
              <button
                onClick={Editpatient}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Edit Profile
              </button>
            </div>

            {/* Ambulance */}
            <div className="bg-orange-50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800">Ambulance</h3>
              </div>
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                Call Ambulance
              </button>
            </div>

            {/* Wallet */}
            <div className="bg-yellow-50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800">Wallet</h3>
              </div>
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                Open Wallet
              </button>
            </div>

            {/* Appointment History - Full Width */}
            <div className="col-span-2 bg-purple-50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800">Appointment</h3>
              </div>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors">
            <Bot className="w-6 h-6" />
          </button>

          <button
            onClick={handleLogout}
            className="px-10 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold shadow-lg transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      <Footer />

    </div>
  );
};

export default PatientProfile;