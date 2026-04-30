import { useState, useEffect, useCallback } from 'react';
import {
    Clock,
    Plus,
    X,
    Loader2,
    Sun,
    Sunset,
    Moon,
    Repeat,
    Timer,
} from 'lucide-react';
import DoctorSidebar from '../components/DoctorSidebar';
import { doctorApi } from '@/constants/backend/doctor/doctor.api';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import axios, { AxiosError } from 'axios';

type SlotSession = 'morning' | 'afternoon' | 'evening';

interface ScheduleRecord {
    id: string;
    daysOfWeek: number[];
    session: SlotSession;
    startTime: string;
    endTime: string;
    slotDuration: number;
    validFrom?: string;
    validUntil?: string;
    isActive: boolean;
    createdAt: string;
}

interface SessionEntry {
    session: SlotSession;
    startTime: string;
    endTime: string;
    slotDuration: string;
}

interface FormState {
    daysOfWeek: number[];
    sessions: SessionEntry[];
}

const EMPTY_FORM: FormState = {
    daysOfWeek: [],
    sessions: [],
};

const SESSION_CONFIG: Record<SlotSession, {
    label: string;
    timeRange: string;
    defaultStart: string;
    defaultEnd: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
    activeBg: string;
    activeBorder: string;
    activeText: string;
}> = {
    morning: {
        label: 'Morning',
        timeRange: '6 AM – 12 PM',
        defaultStart: '08:00',
        defaultEnd: '12:00',
        icon: <Sun className="w-4 h-4" />,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        activeBg: 'bg-amber-50',
        activeBorder: 'border-amber-400',
        activeText: 'text-amber-700',
    },
    afternoon: {
        label: 'Afternoon',
        timeRange: '12 PM – 5 PM',
        defaultStart: '12:00',
        defaultEnd: '17:00',
        icon: <Sunset className="w-4 h-4" />,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        activeBg: 'bg-orange-50',
        activeBorder: 'border-orange-400',
        activeText: 'text-orange-700',
    },
    evening: {
        label: 'Evening',
        timeRange: '5 PM – 9 PM',
        defaultStart: '17:00',
        defaultEnd: '21:00',
        icon: <Moon className="w-4 h-4" />,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        activeBg: 'bg-indigo-50',
        activeBorder: 'border-indigo-400',
        activeText: 'text-indigo-700',
    },
};

const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60];

const WEEKDAYS = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' },
];

function formatTime(time: string) {
    const [h, m] = time.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
}

function getDayNames(days: number[]): string {
    if (days.length === 7) return 'Every day';
    if (days.length === 0) return '';
    return days
        .sort((a, b) => a - b)
        .map(d => WEEKDAYS.find(w => w.value === d)?.label || '')
        .join(', ');
}

export default function DoctorSlotManagement() {
    const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ id: string; status: boolean } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchSchedules = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await doctorApi.getDoctorSchedules({ page: currentPage, limit: 5 });
            if (response.data.success) {
                setSchedules(response.data.data || []);
                const pagination = response.data.pagination;
                setTotalPages(pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Failed to fetch schedules', error);
            toast.error('Failed to load your schedules');
         
        } finally {
            setIsLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const toggleSession = (session: SlotSession) => {
        setForm(f => {
            const exists = f.sessions.find(s => s.session === session);
            if (exists) return { ...f, sessions: f.sessions.filter(s => s.session !== session) };
            const cfg = SESSION_CONFIG[session];
            return {
                ...f,
                sessions: [...f.sessions, { session, startTime: cfg.defaultStart, endTime: cfg.defaultEnd, slotDuration: '' }],
            };
        });
    };

    const updateSessionField = (session: SlotSession, field: keyof Omit<SessionEntry, 'session'>, value: string) => {
        setForm(f => ({
            ...f,
            sessions: f.sessions.map(s => s.session === session ? { ...s, [field]: value } : s),
        }));
    };

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (form.daysOfWeek.length === 0) errs.daysOfWeek = 'Please select at least one day';
        if (form.sessions.length === 0) errs.sessions = 'Please select at least one session';
        form.sessions.forEach(s => {
            if (!s.startTime) errs[`${s.session}_startTime`] = 'Required';
            if (!s.endTime) errs[`${s.session}_endTime`] = 'Required';
            if (!s.slotDuration) errs[`${s.session}_slotDuration`] = 'Required';
            if (s.startTime && s.endTime && s.endTime <= s.startTime)
                errs[`${s.session}_endTime`] = 'End must be after start';
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            setSubmitting(true);
            const promises = form.sessions.map(s =>
                doctorApi.createDoctorSchedule({
                    daysOfWeek: form.daysOfWeek,
                    session: s.session,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    slotDuration: Number(s.slotDuration),
                })
            );
            await Promise.all(promises);
            toast.success('Recurring schedule(s) created successfully');
            setShowForm(false);
            setForm(EMPTY_FORM);
            setErrors({});
            fetchSchedules();
        } catch(error:unknown){
            if (axios.isAxiosError(error)) {
              const message = (error as AxiosError<{ message: string }>).response?.data?.message;
                toast.error(message || "Something went wrong");
                   const timer = setTimeout(() => {
    setShowForm(false);
  }, 3000);
  fetchSchedules()
    return () => clearTimeout(timer);
  } else {
    toast.error("Something went wrong");
  }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: string, status: boolean) => {
        setConfirmDelete({ id, status });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            setDeletingId(confirmDelete.id);
            const response = await doctorApi.deleteDoctorSchedule(confirmDelete.id, confirmDelete.status);
            if (response.data.success) {
                toast.success(confirmDelete.status ? 'Schedule deactivated' : 'Schedule activated');
                fetchSchedules();
            }
        } catch(error:unknown){
               if (axios.isAxiosError(error)) {
              const message = (error as AxiosError<{ message: string }>).response?.data?.message;
                toast.error(message || "Something went wrong");
  } else {
    toast.error("Something went wrong");
  }
        } finally {
            setDeletingId(null);
            setConfirmDelete(null);
        }
    };

    const toggleDay = (day: number) => {
        setForm(f => ({
            ...f,
            daysOfWeek: f.daysOfWeek.includes(day)
                ? f.daysOfWeek.filter(d => d !== day)
                : [...f.daysOfWeek, day].sort((a, b) => a - b),
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <DoctorSidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <div className="bg-white border-b border-slate-200 px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Slot Management
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Set your weekly recurring availability</p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium text-sm shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Recurring Schedule
                        </button>
                    </div>
                </div>

                <div className="flex-1 px-8 py-6 space-y-4 overflow-y-auto">

                    {/* Create Schedule Modal */}
                    {showForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
                                <button
                                    onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setErrors({}); }}
                                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <Repeat className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Weekly Recurring Schedule</h2>
                                        <p className="text-xs text-slate-500">Set availability that repeats every week</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Days of Week */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Select Days <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {WEEKDAYS.map((day) => {
                                                const isSelected = form.daysOfWeek.includes(day.value);
                                                return (
                                                    <button
                                                        key={day.value}
                                                        type="button"
                                                        onClick={() => toggleDay(day.value)}
                                                        className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all
                                                            ${isSelected
                                                                ? 'bg-blue-500 text-white border-blue-500'
                                                                : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                                            }`}
                                                    >
                                                        {day.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.daysOfWeek && <p className="text-xs text-red-500 mt-1">{errors.daysOfWeek}</p>}
                                    </div>

                                    {/* Session Multi-Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Sessions <span className="text-red-500">*</span>
                                            <span className="ml-1 text-xs text-slate-400 font-normal">(select one or more)</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['morning', 'afternoon', 'evening'] as SlotSession[]).map((s) => {
                                                const cfg = SESSION_CONFIG[s];
                                                const isSelected = !!form.sessions.find(se => se.session === s);
                                                return (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => toggleSession(s)}
                                                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all text-center relative
                                                            ${isSelected
                                                                ? `${cfg.activeBg} ${cfg.activeBorder} ${cfg.activeText} border-2`
                                                                : 'border-slate-200 text-slate-500 hover:bg-slate-50 border'
                                                            }`}
                                                    >
                                                        {isSelected && (
                                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                                                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                        <span>{cfg.icon}</span>
                                                        <span className="text-xs font-semibold">{cfg.label}</span>
                                                        <span className="text-[10px] opacity-70">{cfg.timeRange}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.sessions && <p className="text-xs text-red-500 mt-1">{errors.sessions}</p>}
                                    </div>

                                    {/* Session Detail Cards */}
                                    {form.sessions.map((entry) => {
                                        const cfg = SESSION_CONFIG[entry.session];
                                        return (
                                            <div key={entry.session} className={`rounded-xl border-2 ${cfg.activeBorder} ${cfg.activeBg} p-4 space-y-4`}>
                                                <div className={`flex items-center gap-2 text-sm font-semibold ${cfg.activeText}`}>
                                                    {cfg.icon}
                                                    {cfg.label} Session Details
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Start Time *</label>
                                                        <div className="relative">
                                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                            <input
                                                                type="time"
                                                                value={entry.startTime}
                                                                onChange={e => updateSessionField(entry.session, 'startTime', e.target.value)}
                                                                className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400
                                                                    ${errors[`${entry.session}_startTime`] ? 'border-red-400' : 'border-slate-200'}`}
                                                            />
                                                        </div>
                                                        {errors[`${entry.session}_startTime`] && <p className="text-xs text-red-500 mt-0.5">{errors[`${entry.session}_startTime`]}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">End Time *</label>
                                                        <div className="relative">
                                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                            <input
                                                                type="time"
                                                                value={entry.endTime}
                                                                onChange={e => updateSessionField(entry.session, 'endTime', e.target.value)}
                                                                className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400
                                                                    ${errors[`${entry.session}_endTime`] ? 'border-red-400' : 'border-slate-200'}`}
                                                            />
                                                        </div>
                                                        {errors[`${entry.session}_endTime`] && <p className="text-xs text-red-500 mt-0.5">{errors[`${entry.session}_endTime`]}</p>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Slot Duration *</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {DURATION_OPTIONS.map((d) => (
                                                            <button
                                                                key={d}
                                                                type="button"
                                                                onClick={() => updateSessionField(entry.session, 'slotDuration', String(d))}
                                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                                                                    ${entry.slotDuration === String(d)
                                                                        ? 'bg-blue-500 text-white border-blue-500'
                                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                                                    }`}
                                                            >
                                                                {d} min
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {errors[`${entry.session}_slotDuration`] && <p className="text-xs text-red-500 mt-1">{errors[`${entry.session}_slotDuration`]}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Creating Schedule...</>
                                        ) : (
                                            <><Repeat className="w-4 h-4" /> Save Recurring Schedule</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Schedule List */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin opacity-20" />
                            <p className="text-sm text-slate-400 mt-4">Loading your schedules...</p>
                        </div>
                    ) : schedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                            <Repeat className="w-12 h-12 mb-3 opacity-30" />
                            <p className="text-lg font-medium">No recurring schedules yet</p>
                            <p className="text-sm">Add a weekly schedule to start creating slots automatically</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {schedules.map((schedule) => {
                                const cfg = SESSION_CONFIG[schedule.session];
                                return (
                                    <div key={schedule.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all">
                                        <div className="flex items-start gap-5">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 flex-wrap mb-3">
                                                    <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                                        {cfg.icon} {cfg.label}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatTime(schedule.startTime)} – {formatTime(schedule.endTime)}
                                                    </span>
                                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                                        <Repeat className="w-3 h-3" />
                                                        Recurring
                                                    </span>
                                                </div>
                                                <div className="text-slate-700 font-medium">{getDayNames(schedule.daysOfWeek)}</div>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                                                        <Timer className="w-3.5 h-3.5" />
                                                        {schedule.slotDuration} min per slot
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(schedule.id, schedule.isActive)}
                                                disabled={deletingId === schedule.id}
                                                className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 border transition
                                                    ${schedule.isActive
                                                        ? 'text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200'
                                                        : 'text-green-600 border-green-100 hover:bg-green-50 hover:border-green-200'
                                                    } disabled:opacity-50`}
                                            >
                                                {deletingId === schedule.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                {schedule.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>

            {/* Confirm Modal — outside everything else */}
            {confirmDelete && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmDelete.status ? 'bg-red-50' : 'bg-emerald-50'}`}>
                                <Repeat className={`w-8 h-8 ${confirmDelete.status ? 'text-red-500' : 'text-emerald-500'}`} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Are you sure?</h3>
                            <p className="text-slate-500 mt-2 text-sm">
                                You are about to <strong>{confirmDelete.status ? 'deactivate' : 'activate'}</strong> this recurring schedule.
                                This will affect your availability for future bookings.
                            </p>
                        </div>
                        <div className="flex border-t border-slate-100">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 px-6 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition border-r border-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deletingId !== null}
                                className="flex-1 px-6 py-4 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}