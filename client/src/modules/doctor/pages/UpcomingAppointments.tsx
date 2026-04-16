import { useEffect, useState, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Search,
  ChevronDown,
  Video,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  RefreshCw,
  Phone,
} from 'lucide-react';
import DoctorSidebar from '../components/DoctorSidebar';
import { doctorApi } from '@/constants/backend/doctor/doctor.api';
import Pagination from '@/components/Pagination';
import PatientDetailsModal from '../components/PatientDetailsModal';

interface RawAppointment {
  id: string;
  appointmentDate: string;
  visitTime?: string | null;
  mode: 'online' | 'offline';
  status: 'pending' | 'completed' | 'cancelled' | 'canceled';
  tokenNumber: number;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  patientEmail?: string | null;
  patientAddress?: string | null;
  patientImage?: string | null;
  bloodPressure?: string;
  heartRate?: string;
  weight?: string;
  cancelReason?: string | null;
}

interface Appointment {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientAge: number;
  patientAvatar: string;
  image?: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Canceled';
  type: 'Video' | 'In-Person';
  reason: string;
  isNew: boolean;
  phone?: string;
  email?: string;
  address?: string;
  bloodPressure?: string;
  heartRate?: string;
  weight?: string;
  cancelReason?: string;
}

const STATUS_CONFIG = {
  Confirmed: { 
    label: 'Confirmed', 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-50 border-emerald-200', 
    icon: <CheckCircle className="w-3.5 h-3.5" /> 
  },
  Pending: { 
    label: 'Pending', 
    color: 'text-amber-700', 
    bg: 'bg-amber-50 border-amber-200', 
    icon: <AlertCircle className="w-3.5 h-3.5" /> 
  },
  Canceled: { 
    label: 'Canceled', 
    color: 'text-red-700', 
    bg: 'bg-red-50 border-red-200', 
    icon: <XCircle className="w-3.5 h-3.5" /> 
  },
};

const TYPE_CONFIG = {
  Video: { icon: <Video className="w-4 h-4" />, color: 'text-blue-500' },
  'In-Person': { icon: <MapPin className="w-4 h-4" />, color: 'text-violet-500' },
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

export default function UpcomingAppointments() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Video' | 'In-Person'>('All');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAppointmentsData = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const result = await doctorApi.UpcomingAppointments({
        page,
        limit: 5,
        search: debouncedSearch,
        date: selectedDate || undefined,
      });

      if (result.data?.success) {
        const rawData: RawAppointment[] = result.data.data || [];

        const mapped: Appointment[] = rawData.map((item) => {
          const apptDate = new Date(item.appointmentDate);
          const isCanceled = item.status === 'cancelled' || item.status === 'canceled';

          return {
            id: item.id,
            tokenNumber: item.tokenNumber || 0,
            patientName: item.patientName || "Unknown Patient",
            patientAge: item.patientAge || 0,
            patientAvatar: (item.patientName || "PT")
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            date: apptDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            }),
            time: item.visitTime || apptDate.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            status: isCanceled ? 'Canceled' 
                  : item.status === 'pending' ? 'Pending' 
                  : 'Confirmed',
            type: item.mode === 'online' ? 'Video' : 'In-Person',
            reason: isCanceled ? item.cancelReason || "No reason provided" : "General Consultation",
            isNew: item.status === 'pending',
            phone: item.patientPhone,
            email: item.patientEmail || undefined,
            address: item.patientAddress || undefined,
            bloodPressure: item.bloodPressure || undefined,
            heartRate: item.heartRate || undefined,
            weight: item.weight || undefined,
            cancelReason: item.cancelReason || undefined,
            image: item.patientImage || undefined,
          };
        });

        setAppointments(mapped);

        if (result.data.pagination) {
          setTotalPages(result.data.pagination.totalPages || 1);
          setCurrentPage(result.data.pagination.currentPage || page);
        }
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedDate]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch when filters change
  useEffect(() => {
    fetchAppointmentsData(1);
  }, [fetchAppointmentsData]);

  // Fetch when page changes
  useEffect(() => {
    fetchAppointmentsData(currentPage);
  }, [currentPage, fetchAppointmentsData]);

  const filteredAppointments = appointments.filter((appt) => {
    const matchType = typeFilter === 'All' || appt.type === typeFilter;
    return matchType;
  });

  const grouped = groupByDate(filteredAppointments);
  const sortedDates = Object.keys(grouped).sort();


  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DoctorSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Upcoming Appointments</h1>
              <p className="text-slate-500 mt-1">Manage your scheduled consultations</p>
            </div>
         
          </div>

        </div>

        {/* Filters */}
        <div className="bg-white border-b px-8 py-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All Types</option>
              <option value="Video">Video Consultation</option>
              <option value="In-Person">In-Person</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Appointments List */}
        <div className="flex-1 px-8 py-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
              <p className="mt-4 text-slate-500">Loading appointments...</p>
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Calendar className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-xl">No appointments found</p>
              <p className="text-sm mt-2">Try changing filters or date</p>
            </div>
          ) : (
            sortedDates.map((date) => (
              <section key={date} className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-700">{date}</h2>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-sm text-slate-400">
                    {grouped[date].length} appointment{grouped[date].length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-4">
                  {grouped[date].map((appt) => {
                    const statusCfg = STATUS_CONFIG[appt.status];
                    const typeCfg = TYPE_CONFIG[appt.type];
                    const avatarColor = AVATAR_COLORS[appt.patientName.length % AVATAR_COLORS.length];

                    return (
                      <div
                        key={appt.id}
                        className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-5">
                          {/* Avatar */}
                          <div className={`w-14 h-14 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden`}>
                            {appt.image ? (
                              <img src={appt.image} alt={appt.patientName} className="w-full h-full object-cover" />
                            ) : (
                              appt.patientAvatar
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{appt.patientName}</h3>
                              <span className="text-sm text-slate-500">• {appt.patientAge} years</span>
                              {(appt.bloodPressure || appt.heartRate || appt.weight) && (
                                <span className="text-xs text-slate-400 font-medium ml-2 italic">
                                  ({[
                                    appt.bloodPressure && `BP: ${appt.bloodPressure}`,
                                    appt.heartRate && `HR: ${appt.heartRate}`,
                                    appt.weight && `WT: ${appt.weight}kg`
                                  ].filter(Boolean).join(", ")})
                                </span>
                              )}
                              <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                Token #{appt.tokenNumber}
                              </span>
                            </div>

                            {appt.phone && (
                              <p className="text-sm text-slate-500 mt-1">   <Phone className="w-4 h-4" /> {appt.phone}</p>
                            )}
                          </div>

                          {/* Time & Type */}
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end text-slate-600">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{appt.time}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 justify-end mt-2 ${typeCfg.color}`}>
                              {typeCfg.icon}
                              <span className="text-sm font-medium">{appt.type}</span>
                            </div>
                          </div>

                          {/* Status */}
                          <div className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 ${statusCfg.color} ${statusCfg.bg}`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                          </div>

                          {/* View Button */}
                          <button
                            onClick={() => {
                              setSelectedAppointment(appt);
                              setIsModalOpen(true);
                            }}
                            className="p-3 rounded-xl hover:bg-slate-100 transition"
                          >
                            <User className="w-5 h-5 text-slate-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}

  
          {!isLoading && totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      <PatientDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
}