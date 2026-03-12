import { useState, useEffect, useCallback } from 'react';
import {
    CalendarOff,
    CalendarDays,
    Clock,
    FileText,
    Upload,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    X,
    ChevronDown,
    Loader2,
} from 'lucide-react';
import DoctorSidebar from '../components/DoctorSidebar';
import { doctorApi } from '@/constants/backend/doctor/doctor.api';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/hooks/redux';
import Pagination from '@/components/Pagination';

// ─── Types ───────────────────────────────────────────────────────────────────

type LeaveSession = 'morning' | 'afternoon' | 'evening' | 'night';
type LeaveStatus = 'approved' | 'pending' | 'rejected';

interface LeaveRecord {
    _id: string;
    startDate: string;
    endDate: string;
    leaveSession?: LeaveSession;
    reason?: string;
    photo?: string;
    rejectedReson?: string;
    status: LeaveStatus;
    createdAt: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<LeaveStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    approved: {
        label: 'Approved',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: <CheckCircle className="w-4 h-4" />,
    },
    pending: {
        label: 'Pending',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: <AlertCircle className="w-4 h-4" />,
    },
    rejected: {
        label: 'Rejected',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: <XCircle className="w-4 h-4" />,
    },
};

const SESSION_LABELS: Record<LeaveSession, string> = {
    morning: '🌅 Morning',
    afternoon: '☀️ Afternoon',
    evening: '🌆 Evening',
    night: '🌙 Night',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

function daysBetween(start: string, end: string) {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.round(diff / 86400000) + 1);
}

// ─── Apply Form ───────────────────────────────────────────────────────────────

interface FormState {
    startDate: string;
    endDate: string;
    leaveSession: LeaveSession | '';
    reason: string;
    photo: File | null;
}

const EMPTY_FORM: FormState = {
    startDate: '',
    endDate: '',
    leaveSession: '',
    reason: '',
    photo: null,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DoctorLeaveManagement() {
    const { profileData } = useAppSelector((state) => state.auth);

    const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Pagination & Filtering
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterDate, setFilterDate] = useState('');
    const [totalRequests, setTotalRequests] = useState(0);

    const fetchLeaves = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await doctorApi.getDoctorLeaves({
                page: currentPage,
                limit: 5,
                startDate: filterDate || undefined
            });

            if (response.data.success) {
               
                setLeaves(response.data.data.data);
                setTotalPages(Math.ceil(response.data.data.total / 5));
                setTotalRequests(response.data.data.total);
            }
        } catch (error) {
            console.error("Failed to fetch leaves", error);
            toast.error("Failed to load leave requests");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, filterDate]);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    // Form validation
    const validate = (): boolean => {
        const e: typeof errors = {};
        if (!form.startDate) e.startDate = 'Start date is required';
        if (!form.endDate) e.endDate = 'End date is required';
        if (form.startDate && form.endDate && form.endDate < form.startDate)
            e.endDate = 'End date must be after start date';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setForm((f) => ({ ...f, photo: file }));
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPhotoPreview(null);
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSubmitting(true);

            const response = await doctorApi.doctorApplyleave({
                startDate: form.startDate,
                endDate: form.endDate,
                leaveSession: form.leaveSession || undefined,
                reason: form.reason,
                photo: photoPreview,
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setShowForm(false);
                setForm(EMPTY_FORM);
                setPhotoPreview(null);
                fetchLeaves(); // Refresh the list
            }

        } catch (error) {
            console.error("Leave apply failed", error);
            toast.error("Failed to submit leave request");
        } finally {
            setSubmitting(false);
        }
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
                                Leave Management
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Apply for leave and track your leave requests</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Date Filter */}
                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                                    className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                {filterDate && (
                                    <button
                                        onClick={() => { setFilterDate(''); setCurrentPage(1); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
                                    >
                                        <X className="w-3 h-3 text-slate-400" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => { setShowForm(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium text-sm shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Apply for Leave
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Total Requests</span>
                            <span className="text-2xl font-bold text-slate-700">{totalRequests}</span>
                        </div>
                        <div className="col-span-3 opacity-50 flex items-center text-xs text-slate-400 uppercase tracking-widest font-bold">
                            Filtering leaves for doctor: {profileData?.name || 'Loading...'}
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-8 py-6 space-y-4 overflow-y-auto">

                    {/* ── Apply Form Modal ── */}
                    {showForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
                                {/* Close */}
                                <button
                                    onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setPhotoPreview(null); setErrors({}); }}
                                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <CalendarOff className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Apply for Leave</h2>
                                        <p className="text-xs text-slate-500">Fill in the details and submit</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Date Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Start Date <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="date"
                                                    value={form.startDate}
                                                    min={new Date().toISOString().slice(0, 10)}
                                                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                                                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.startDate ? 'border-red-400' : 'border-slate-200'}`}
                                                />
                                            </div>
                                            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                End Date <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="date"
                                                    value={form.endDate}
                                                    min={form.startDate || new Date().toISOString().slice(0, 10)}
                                                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                                                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.endDate ? 'border-red-400' : 'border-slate-200'}`}
                                                />
                                            </div>
                                            {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                                        </div>
                                    </div>

                                    {/* Duration preview */}
                                    {form.startDate && form.endDate && form.endDate >= form.startDate && (
                                        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            {daysBetween(form.startDate, form.endDate)} day{daysBetween(form.startDate, form.endDate) !== 1 ? 's' : ''} leave requested
                                        </div>
                                    )}

                                    {/* Session */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Leave Session</label>
                                        <div className="relative">
                                            <select
                                                value={form.leaveSession}
                                                onChange={(e) => setForm((f) => ({ ...f, leaveSession: e.target.value as LeaveSession | '' }))}
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none bg-white"
                                            >
                                                <option value="">Select session (optional)</option>
                                                <option value="morning">🌅 Morning</option>
                                                <option value="afternoon">☀️ Afternoon</option>
                                                <option value="evening">🌆 Evening</option>
                                                <option value="night">🌙 Night</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> Reason</span>
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={form.reason}
                                            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                                            placeholder="Briefly describe the reason for leave…"
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                        />
                                    </div>

                                    {/* Photo upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            <span className="flex items-center gap-1.5"><Upload className="w-4 h-4" /> Supporting Document / Photo</span>
                                        </label>
                                        {photoPreview ? (
                                            <div className="relative rounded-xl overflow-hidden border border-slate-200">
                                                <img src={photoPreview} alt="preview" className="w-full h-32 object-cover" />
                                                <button
                                                    onClick={() => { setPhotoPreview(null); setForm((f) => ({ ...f, photo: null })); }}
                                                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow border border-slate-200 text-slate-500 hover:text-red-500"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-6 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition">
                                                <Upload className="w-5 h-5 text-slate-400" />
                                                <span className="text-xs text-slate-500">Click to upload image or PDF</span>
                                                <input type="file" accept="image/*,.pdf" onChange={handlePhotoChange} className="hidden" />
                                            </label>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit Leave Request'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Leave Records ── */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin opacity-20" />
                            <p className="text-sm text-slate-400 mt-4">Loading your leave requests...</p>
                        </div>
                    ) : leaves.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                            <CalendarOff className="w-12 h-12 mb-3 opacity-30" />
                            <p className="text-lg font-medium">No leave requests yet</p>
                            <p className="text-sm">Click "Apply for Leave" to submit your first request</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {leaves.map((leave) => {
                                    const cfg = STATUS_CONFIG[leave.status];
                                    return (
                                        <div
                                            key={leave._id}
                                            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-blue-100 transition-all"
                                        >
                                            <div className="flex items-start gap-5">
                                                {/* Left: date block */}
                                                <div className="flex-shrink-0 w-16 text-center">
                                                    <div className="bg-blue-500 text-white rounded-xl px-2 py-1 text-xs font-semibold">
                                                        {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                                                    </div>
                                                    <div className="text-2xl font-bold text-slate-800 mt-1">
                                                        {new Date(leave.startDate).getDate()}
                                                    </div>
                                                </div>

                                                {/* Middle: info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap mb-2">
                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {formatDate(leave.startDate)}
                                                            {leave.startDate !== leave.endDate && ` → ${formatDate(leave.endDate)}`}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            · {daysBetween(leave.startDate, leave.endDate)} day{daysBetween(leave.startDate, leave.endDate) !== 1 ? 's' : ''}
                                                        </span>
                                                        {leave.leaveSession && (
                                                            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                                                                {SESSION_LABELS[leave.leaveSession]}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {leave.reason && (
                                                        <p className="text-sm text-slate-600 mb-1">{leave.reason}</p>
                                                    )}

                                                    {leave.status === 'rejected' && leave.rejectedReson && (
                                                        <div className="flex items-start gap-2 mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                                            <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                                            <span><strong>Rejection reason:</strong> {leave.rejectedReson}</span>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-slate-400 mt-2">
                                                        Submitted on {formatDate(leave.createdAt)}
                                                    </p>
                                                  
                                                    
                                                </div>

                                                {/* Right: status + actions */}
                                                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                                                        {cfg.icon}
                                                        {cfg.label}
                                                    </div>

                                                    {leave.photo && (
                                                        <img
                                                            src={leave.photo}
                                                            alt="doc"
                                                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 cursor-pointer hover:scale-105 transition"
                                                            onClick={() => window.open(leave.photo, '_blank')}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
