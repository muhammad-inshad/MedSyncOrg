import React, { useEffect, useState } from 'react';
import Navbar from '@/modules/patient/components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, Hash, ChevronRight, MapPin, Monitor, X, Activity, Heart, Weight, User, Phone, Mail, Home, Ban, Loader2 } from 'lucide-react';
import { patientApi } from '@/constants/backend/patient/patient.api';
import { useAppSelector } from '@/hooks/redux';
import Pagination from '@/components/Pagination';
import toast from 'react-hot-toast';
import axios from "axios";
import { useDebouncedCallback } from 'use-debounce';

type AppointmentStatus = 'pending' | 'completed' | 'cancelled'| 'processing' | 'rejected';
type AppointmentMode = 'online' | 'offline';

interface IAppointment {
    id: string;
    doctorId: { name: string; specialization: string; department: string; profileImage: string; };
    appointmentDate: string;
    tokenNumber: number;
    visitTime: string;
    mode: AppointmentMode;
    status: AppointmentStatus;
    patientDetails: { name: string; age: number; phone: string; email?: string; address?: string; };
    rejectionReason?: string;
    bloodPressure?: string;
    heartRate?: string;
    weight?: string;
    createdAt: string;
}

interface AppointmentHistoryItem {
    id: string;

    patientName: string;
    patientAge: number;
    patientPhone: string;

    doctorId: string;
    doctorName?: string;
    doctorSpecialization?: string;
    doctorDepartment?: string;
    doctorProfileImage?: string;

    rejectionReason?: string;

    [key: string]: unknown;
}

// ── Status config ──────────────────────────────────────────────────────────────
const statusCfg = {
    pending: { label: 'Upcoming', cls: 'bg-[#1a9e6e] text-white' },
    completed: { label: 'Completed', cls: 'bg-[#2563a8] text-white' },
    cancelled: { label: 'Cancelled', cls: 'bg-[#e05a5a] text-white' },
    processing: { label: 'Processing', cls: 'bg-[#d97706] text-white' },
    rejected: { label: 'Rejected', cls: 'bg-[#e05a5a] text-white' }
};

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const AppointmentHistory = () => {
    const searchQuery = useAppSelector((state) => state.search.query);
    const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');
    const [selected, setSelected] = useState<IAppointment | null>(null);
    const [appointments, setAppointments] = useState<IAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;

    // Cancel modal state
    const [cancelTarget, setCancelTarget] = useState<IAppointment | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    const handleSearch = useDebouncedCallback((value: string) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
    }, 500);

    useEffect(() => {
        handleSearch(searchQuery);
    }, [filter, handleSearch, searchQuery]);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const result = await patientApi.getAppoimentHistory(currentPage, limit, debouncedSearch);
                const responseData = result.data;

                if (responseData.success) {
                    const mappedData = responseData.data.map((item:AppointmentHistoryItem) => ({
                        ...item,
                        id: item.id,
                        patientDetails: {
                            name: item.patientName,
                            age: item.patientAge,
                            phone: item.patientPhone,
                        },
                        doctorId: { 
                            id: item.doctorId,
                            name: item.doctorName || 'Unknown Doctor', 
                            specialization: item.doctorSpecialization || 'General',
                            department: item.doctorDepartment || 'General Medicine', 
                            profileImage: item.doctorProfileImage || 'https://via.placeholder.com/150' 
                        },
                        rejectionReason: item.rejectionReason||"",
                    }));

                    setAppointments(mappedData);
                    setTotalPages(responseData.pagination?.totalPages || 1);
                } else {
                    setAppointments([]);
                }
            } catch (err) {
                console.error('Failed to fetch appointments', err);
                setAppointments([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filter]);

    const handleCancelSubmit = async () => {
        if (!cancelTarget || !cancelReason.trim()) return;
        setIsCancelling(true);
        try {
            await patientApi.cancelAppointment(cancelTarget.id, { reason: cancelReason });
            setAppointments(prev =>
                prev.map(a => a.id === cancelTarget.id
                    ? { ...a, status: 'processing', rejectionReason: cancelReason }
                    : a
                )
            );

            if (selected?.id === cancelTarget.id) {
                setSelected(prev => prev ? { ...prev, status: 'cancelled', rejectionReason: cancelReason } : null);
            }
            toast.success("Appointment cancelled successfully");
            setCancelTarget(null);
            setCancelReason('');
        } catch (err: unknown) {
            let message = "Failed to cancel appointment";
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message ?? message;
            }
            toast.error(message);
            console.error("Cancel appointment error:", err);
        } finally {
            setIsCancelling(false);
        }
    };

    const list = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    return (
        <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f5f7fa' }}>
            <Navbar />

            {/* Hero Banner */}
            <div className="relative h-56 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1b4b 0%, #1a3a7c 60%, #1a6fa8 100%)' }}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)' }} />
                <div className="relative h-full flex items-center px-8 md:px-20">
                    <div>
                        <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-2">Patient Portal</p>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Appointment History</h1>
                        <div className="mt-3 h-1 w-20 rounded-full" style={{ background: 'linear-gradient(90deg, #38bdf8, #1a9e6e)' }} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex gap-2 flex-wrap order-2 md:order-1">
                        {(['all', 'pending', 'completed', 'cancelled'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className="px-5 py-2 rounded-full text-sm font-semibold border transition-all"
                                style={filter === f
                                    ? { backgroundColor: '#0d1b4b', color: '#fff', borderColor: '#0d1b4b' }
                                    : { backgroundColor: '#fff', color: '#4a5568', borderColor: '#d1d5db' }}>
                                {f === 'pending' ? 'Upcoming' : f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-400" />
                        <p className="font-medium">Loading your appointments...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {list.length === 0 && (
                            <div className="text-center py-20 text-gray-400">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No appointments found.</p>
                            </div>
                        )}

                        {list.map((appt) => {
                            const s = statusCfg[appt.status];
                            return (
                                <div key={appt.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4 px-6 py-4">
                                        <img src={appt.doctorId.profileImage} alt={appt.doctorId.name}
                                            onClick={() => setSelected(appt)}
                                            className="w-14 h-14 rounded-full object-cover border-2 shrink-0 cursor-pointer"
                                            style={{ borderColor: '#e2e8f0' }} />

                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelected(appt)}>
                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                <span className="font-bold text-gray-900">Dr. {appt.doctorId.name}</span>
                                                <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                                            </div>
                                            <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" />{fmt(appt.appointmentDate)}</span>
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" />{appt.visitTime}</span>
                                                <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-blue-400" />token {appt.tokenNumber}</span>
                                                <span className="flex items-center gap-1.5">
                                                    {appt.mode === 'online' ? <Monitor className="w-3.5 h-3.5 text-indigo-400" /> : <MapPin className="w-3.5 h-3.5 text-indigo-400" />}
                                                    <span className="capitalize">{appt.mode}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {(appt.status === 'pending' || appt.status === 'rejected') && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setCancelTarget(appt); }}
                                                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-all"
                                                    style={{ color: '#e05a5a', borderColor: '#fecaca', backgroundColor: '#fff5f5' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e05a5a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff5f5'; (e.currentTarget as HTMLElement).style.color = '#e05a5a'; }}>
                                                    <Ban className="w-3.5 h-3.5" /> Cancel
                                                </button>
                                            )}
                                            <ChevronRight onClick={() => setSelected(appt)} className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />

            {/* Appointment Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                    style={{ backgroundColor: 'rgba(13,27,75,0.65)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setSelected(null)}>
                    <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
                        onClick={e => e.stopPropagation()}>
                        {/* Your original detail modal content (unchanged) */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100"
                            style={{ background: 'linear-gradient(135deg, #0d1b4b, #1a3a7c)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-white font-bold text-lg">Appointment Details</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {selected.status === 'pending' && (
                                    <button onClick={() => { setSelected(null); setCancelTarget(selected); }}
                                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-rose-500/20 text-rose-200 hover:bg-rose-500 hover:text-white transition-all border border-rose-400/30">
                                        <Ban className="w-3.5 h-3.5" /> Cancel Appointment
                                    </button>
                                )}
                                <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* ... Your existing detail modal content ... */}
                            {selected.status === 'cancelled' && selected.rejectionReason && (
                                <div className="rounded-xl p-4 border" style={{ backgroundColor: '#fff5f5', borderColor: '#fecaca' }}>
                                    <p className="text-xs font-bold uppercase text-rose-500 mb-1">Cancellation Reason</p>
                                    <p className="text-sm text-gray-700">{selected.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal - Updated */}
            {cancelTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(13,27,75,0.70)', backdropFilter: 'blur(6px)' }}
                    onClick={() => { setCancelTarget(null); setCancelReason(''); }}>

                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}>

                        <div className="px-6 py-5 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)' }}>
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Ban className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Cancel Appointment</h3>
                                <p className="text-red-200 text-xs">Dr. {cancelTarget.doctorId.name} · {fmt(cancelTarget.appointmentDate)}</p>
                            </div>
                            <button onClick={() => { setCancelTarget(null); setCancelReason(''); }}
                                className="ml-auto w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Show rejectionReason if exists */}
                            {cancelTarget.rejectionReason && (
                                <div className="rounded-xl p-4 bg-rose-50 border border-rose-200">
                                    <p className="text-xs font-bold uppercase text-rose-600 mb-1">Rejection Reason</p>
                                    <p className="text-sm text-gray-700">{cancelTarget.rejectionReason}</p>
                                </div>
                            )}

                            <p className="text-sm text-gray-500">Please let us know why you're cancelling. This helps us improve our service.</p>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                    Reason for Cancellation <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={e => setCancelReason(e.target.value)}
                                    placeholder="e.g. Schedule conflict, feeling better, etc."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border text-sm text-gray-700 resize-none outline-none transition-all"
                                    style={{ borderColor: cancelReason.trim() ? '#d1d5db' : '#fca5a5', backgroundColor: '#fafafa' }}
                                    onFocus={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                                    onBlur={e => (e.currentTarget.style.borderColor = cancelReason.trim() ? '#d1d5db' : '#fca5a5')}
                                />
                                {!cancelReason.trim() && (
                                    <p className="text-xs text-rose-400 mt-1">A reason is required to proceed.</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={() => { setCancelTarget(null); setCancelReason(''); }}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                                    Keep Appointment
                                </button>
                                <button
                                    onClick={handleCancelSubmit}
                                    disabled={!cancelReason.trim() || isCancelling}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: isCancelling ? '#9ca3af' : '#e05a5a' }}
                                    onMouseEnter={e => { if (!isCancelling && cancelReason.trim()) (e.currentTarget as HTMLElement).style.backgroundColor = '#b91c1c'; }}
                                    onMouseLeave={e => { if (!isCancelling) (e.currentTarget as HTMLElement).style.backgroundColor = '#e05a5a'; }}>
                                    {isCancelling ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</> : <><Ban className="w-4 h-4" /> Confirm Cancel</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentHistory;