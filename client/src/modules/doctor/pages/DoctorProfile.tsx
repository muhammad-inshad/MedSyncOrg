import React from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Clock,
  CreditCard,
  FileText,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Edit3,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/store/store';
import type { DoctorProfile, BaseUser } from '@/store/auth/auth.type';
import { DOCTOR_ROUTES } from '@/constants/frontend/doctor/doctor.routes';

const DoctorProfilePage: React.FC = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const userData = (user as (BaseUser & { _doc?: DoctorProfile }))?._doc ?? (user as DoctorProfile);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
          <ShieldCheck className="w-16 h-16 mx-auto text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Profile Not Found</h2>
          <p className="text-gray-600 mb-8">We couldn't load your profile. Please sign in again.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Clean Header Bar ─── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dr. {userData.name?.split(' ').pop() || 'Doctor'}
            </h1>
            <p className="text-blue-600 font-medium">
              {userData.specialization || 'Specialist'}
            </p>
          </div>
          <button
            onClick={() => navigate(DOCTOR_ROUTES.DOCTOREDITPROFILE)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Edit3 size={18} />
            Edit Profile
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ─── Left Column ─── */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile Card with Cover */}
            <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
              {/* Cover / Banner area */}
              <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                {userData.profileImage && (
                  <img
                    src={userData.profileImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                )}
              </div>

              <div className="relative px-8 pb-8">
                {/* Avatar overlapping cover */}
                <div className="-mt-16 mb-6 flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                      {userData.profileImage ? (
                        <img
                          src={userData.profileImage}
                          alt={userData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <User size={56} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 p-2 rounded-full border-4 border-white shadow">
                      <ShieldCheck size={20} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {userData.name || 'Doctor Name'}
                  </h2>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
                    {userData.specialization || 'Specialization'}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                    <MapPin size={18} />
                    <span>{userData.address?.split(',')[0] || 'Location not set'}</span>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-xl text-gray-500">
                        <Mail size={20} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Email</div>
                        <div className="font-medium text-gray-800">{userData.email}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-xl text-gray-500">
                        <Phone size={20} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Phone</div>
                        <div className="font-medium text-gray-800">{userData.phone || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
                    <Award size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Experience</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {userData.experience || 0} Years
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-4 bg-green-100 text-green-600 rounded-xl">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Member Since</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column ─── */}
          <div className="lg:col-span-8 space-y-8">
            {/* About */}
            <section className="bg-white rounded-2xl shadow border border-gray-200 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-amber-100 text-amber-600 rounded-xl">
                  <FileText size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Professional Summary</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {userData.about ||
                  'No biography added yet. Share your experience, philosophy, and areas of expertise with patients.'}
              </p>
            </section>

            {/* Qualifications + Hours */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
                    <Briefcase size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Qualifications</h3>
                </div>
                <div className="mt-auto bg-gray-50 p-5 rounded-xl">
                  <p className="font-semibold text-gray-800">{userData.qualification || 'Not specified'}</p>
                  <p className="text-sm text-gray-600 mt-1">{userData.department || 'General Medicine'}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Availability</h3>
                </div>
                <div className="mt-auto bg-gray-50 p-5 rounded-xl flex items-center justify-between gap-6">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                      From
                    </div>
                    <div className="font-bold text-gray-800">
                      {userData.consultationTime?.start || '—'}
                    </div>
                  </div>
                  <ArrowRight className="text-gray-400" />
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                      To
                    </div>
                    <div className="font-bold text-gray-800">
                      {userData.consultationTime?.end || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Limits */}
            <section className="bg-white rounded-2xl shadow border border-gray-200 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-purple-100 text-purple-600 rounded-xl">
                  <CreditCard size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Practice & Payment Info</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: 'Payment Model', value: userData.payment?.type || '—' },
                  { label: 'Payout Cycle', value: userData.payment?.payoutCycle || 'Monthly' },
                  {
                    label: 'Daily Limit',
                    value: `${userData.payment?.patientsPerDayLimit || 0} patients`,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                      {item.label}
                    </div>
                    <div className="text-xl font-bold text-gray-900 capitalize">{item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* License */}
            {userData.licence && (
              <section className="bg-white rounded-2xl shadow border border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-green-100 text-green-600 rounded-xl">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Medical License</h2>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-200 group relative cursor-pointer">
                  <img
                    src={userData.licence}
                    alt="Medical License"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-lg">
                      View full document
                    </span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorProfilePage;