import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Video,
  MapPin,
  Phone,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  FileText,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import DoctorSidebar from '../components/DoctorSidebar';
import { doctorApi } from '@/constants/backend/doctor/doctor.api';
import { useAppSelector } from '../../../hooks/redux';
import Pagination from '@/components/Pagination';
import PatientDetailsModal from '../components/PatientDetailsModal';

type AppointmentStatus = 'Confirmed' | 'Pending' | 'Canceled';
type AppointmentType = 'Video' | 'In-Person' | 'Phone';

interface Appointment {
  image?: string;
  tokenNumber: number;
  id: string;
  patientName: string;
  patientAge: number;
  patientAvatar: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  isNew: boolean;
  bloodPressure?: string;
  heartRate?: string;
  weight?: string;
  phone?: string;
  email?: string;
  address?: string;
}

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  Confirmed: { label: 'Upcoming', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  Pending: { label: 'Review', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  Canceled: { label: 'Canceled', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const TYPE_CONFIG: Record<AppointmentType, { icon: React.ReactNode; color: string }> = {
  'Video': { icon: <Video className="w-4 h-4" />, color: 'text-blue-500' },
  'In-Person': { icon: <MapPin className="w-4 h-4" />, color: 'text-violet-500' },
  'Phone': { icon: <Phone className="w-4 h-4" />, color: 'text-teal-500' },
};

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-rose-500', 'bg-amber-500', 'bg-teal-500',
];

function groupByDate(appointments: Appointment[]) {
  return appointments.reduce<Record<string, Appointment[]>>((acc, appt) => {
    (acc[appt.date] = acc[appt.date] || []).push(appt);
    return acc;
  }, {});
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function UpcomingAppointments() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | AppointmentType>('All');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const doctorId = user?._id;

  const filtered = appointments.filter((a) => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchType = typeFilter === 'All' || a.type === typeFilter;
    return matchStatus && matchType;
  });

  const fetchAppointmentsData = async (page: number = 1) => {
    if (!doctorId) return;
    setIsLoading(true);
    try {
      const result = await doctorApi.UpcomingAppointments(doctorId as string, {
        page,
        limit: 5,
        search: debouncedSearch,
        date: selectedDate || undefined
      });

      if (result.data?.success && Array.isArray(result.data.data)) {
        const mapped: Appointment[] = result.data.data.map((item: any) => {
          const appointmentDate = new Date(item.appointmentDate);
          return {
            id: item._id,
            image: item.bookedBy?.image,
            tokenNumber: item.tokenNumber,
            patientName: item.patientDetails?.name || 'Unknown',
            patientAge: item.patientDetails?.age || 0,
            patientAvatar: item.patientDetails?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'PT',
            date: appointmentDate.toLocaleDateString(),
            time: item.visitTime || 'TBD',
            duration: 30,
            status: item.status === 'pending' ? 'Confirmed' : item.status === 'completed' ? 'Confirmed' : 'Canceled', // Map pending/completed to Confirmed/Upcoming for doc
            type: item.mode === 'online' ? 'Video' : 'In-Person',
            reason: item.reason || 'General Consultation',
            isNew: item.status === 'pending',
            bloodPressure: item.bloodPressure,
            heartRate: item.heartRate,
            weight: item.weight,
            phone: item.patientDetails?.phone,
            email: item.patientDetails?.email,
            address: item.patientDetails?.address,
          };
        });
        setAppointments(mapped);
        if (result.data.pagination) {
          setTotalPages(result.data.pagination.totalPages);
          setCurrentPage(result.data.pagination.page);
        }
      } else {
        setAppointments([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchAppointmentsData(1);
  }, [doctorId, selectedDate, debouncedSearch]);

  useEffect(() => {
    fetchAppointmentsData(currentPage);
  }, [currentPage]);

  const grouped = groupByDate(filtered);
  const sortedDates = Object.keys(grouped).sort();

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === 'Confirmed').length,
    pending: appointments.filter((a) => a.status === 'Pending').length,
    canceled: appointments.filter((a) => a.status === 'Canceled').length,
  };

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    setOpenMenu(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />

      <DoctorSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                Upcoming Appointments
              </h1>
              <p className="text-slate-500 text-sm mt-1">Manage and review your scheduled consultations</p>
            </div>
            <button
              onClick={() => fetchAppointmentsData(currentPage)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Schedule
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'bg-slate-100 text-slate-700', border: 'border-slate-200' },
              { label: 'Confirmed', value: stats.confirmed, color: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200' },
              { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-700', border: 'border-amber-200' },
              { label: 'Canceled', value: stats.canceled, color: 'bg-red-50 text-red-700', border: 'border-red-200' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border ${s.border} ${s.color} px-5 py-4 flex items-center justify-between`}>
                <span className="text-sm font-medium">{s.label}</span>
                <span className="text-2xl font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient or reason…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Date Picker */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>


          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="pl-4 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none bg-white"
            >
              <option value="All">All Types</option>
              <option value="Video">Video</option>
              <option value="In-Person">In-Person</option>
              <option value="Phone">Phone</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* ── Appointments List ── */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-pulse">
              <RefreshCw className="w-12 h-12 mb-3 animate-spin opacity-30" />
              <p className="text-lg font-medium">Loading appointments...</p>
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Calendar className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No appointments found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            sortedDates.map((date) => (
              <section key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold">{date}</span>
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400">{grouped[date].length} appointment{grouped[date].length !== 1 ? 's' : ''}</span>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {grouped[date].map((appt, idx) => {
                    const statusCfg = STATUS_CONFIG[appt.status];
                    const typeCfg = TYPE_CONFIG[appt.type];
                    const avatarColor = AVATAR_COLORS[appt.patientName.length % AVATAR_COLORS.length];

                    return (
                      <div
                        key={appt.id}
                        className={`
                          bg-white rounded-xl border border-slate-200 p-5
                          hover:shadow-md hover:border-blue-200 transition-all duration-200
                          ${appt.status === 'Canceled' ? 'opacity-60' : ''}
                        `}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 relative overflow-hidden`}>
                            {appt.image ? (
                              <img src={appt.image} alt={appt.patientName} className="w-full h-full object-cover" />
                            ) : (
                              appt.patientAvatar
                            )}
                            {appt.isNew && (
                              <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white z-10" />
                            )}
                          </div>

                          {/* Patient Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-800 text-sm">{appt.patientName}</h3>
                              <span className="text-xs text-slate-400">· {appt.patientAge} yrs</span>
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase ml-1">
                                Token #{appt.tokenNumber}
                              </span>
                            </div>

                            {/* Vitals Row */}
                            <div className="flex items-center gap-3 text-[10px] font-medium">
                              {appt.bloodPressure && (
                                <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                  <span className="text-slate-400 font-bold uppercase">BP:</span>
                                  <span>{appt.bloodPressure}</span>
                                </div>
                              )}
                              {appt.heartRate && (
                                <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                  <span className="text-slate-400 font-bold uppercase">HR:</span>
                                  <span>{appt.heartRate} bpm</span>
                                </div>
                              )}
                              {appt.weight && (
                                <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                  <span className="text-slate-400 font-bold uppercase">WT:</span>
                                  <span>{appt.weight} kg</span>
                                </div>
                              )}
                              {!appt.bloodPressure && !appt.heartRate && !appt.weight && (
                                <span className="text-slate-400 italic">No vitals recorded</span>
                              )}
                            </div>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-1.5 text-slate-600 min-w-fit">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-medium">{appt.time}</span>
                            <span className="text-xs text-slate-400">· {appt.duration}min</span>
                          </div>

                          {/* Type */}
                          <div className={`flex items-center gap-1.5 ${typeCfg.color} min-w-fit`}>
                            {typeCfg.icon}
                            <span className="text-xs font-medium">{appt.type}</span>
                          </div>

                          {/* Status Badge */}
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${statusCfg.color} ${statusCfg.bg} min-w-fit`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-2">
                            {appt.status !== 'Canceled' && (
                              <>
                                <button
                                  title="View profile"
                                  onClick={() => {
                                    setSelectedAppointment(appt);
                                    setIsModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                >
                                  <User className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
}