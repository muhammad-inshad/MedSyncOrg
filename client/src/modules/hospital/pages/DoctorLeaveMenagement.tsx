import { useState, useEffect, useCallback } from 'react';
import { 
  Search, CheckCircle, XCircle, Eye, Clock, CalendarDays, Users, 
  FileWarning, UserCheck, Sun, Sunset, Moon, CloudSun, X, AlertTriangle 
} from 'lucide-react';
import { hospitalApi } from '@/constants/backend/hospital/hospital.api';
import Pagination from '@/components/Pagination';
import toast from 'react-hot-toast';
import { StatsCards } from "../components/tables/StatsCards";
import { FilterTabs } from "../components/tables/FilterTabs";
import { DataTable } from "../components/tables/DataTable";
import type { IDoctorLeave } from '@/interfaces/IDoctorLeave';


type TableColumn<Key = string> = {
  key: Key;
  label: string;
};
// --- HELPERS ---
const sessionConfig = {
  morning: { icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100', label: 'Morning' },
  afternoon: { icon: CloudSun, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', label: 'Afternoon' },
  evening: { icon: Sunset, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', label: 'Evening' },
  night: { icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', label: 'Night' },
};

const getStatusBadge = (status: string, endDate: string) => {
  const today = new Date();
  const leaveEndDate = new Date(endDate);
  const isExpired = today > leaveEndDate && status === 'pending';

  const displayStatus = isExpired ? 'expired' : status;

  const map: Record<string, { cls: string; label: string; icon?: React.ReactNode }> = {
    pending: { 
      cls: 'bg-blue-100 text-blue-700 border-blue-200', 
      label: 'Pending Review' 
    },
    approved: { 
      cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
      label: 'Approved' 
    },
    rejected: { 
      cls: 'bg-rose-100 text-rose-700 border-rose-200', 
      label: 'Rejected' 
    },
    expired: { 
      cls: 'bg-amber-100 text-amber-700 border-amber-200', 
      label: 'Expired',
      icon: <AlertTriangle className="w-3.5 h-3.5" />
    },
  };

  const { cls, label, icon } = map[displayStatus] || { 
    cls: 'bg-gray-100 text-gray-600 border-gray-200', 
    label: status 
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {icon}
      {label}
    </span>
  );
};

const formatDate = (d: string) => 
  new Date(d).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

const getDuration = (start: string, end: string) => {
  const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  return `${diff} day${diff !== 1 ? 's' : ''}`;
};

// Check if leave is expired (only for pending leaves)
const isLeaveExpired = (endDate: string, status: string): boolean => {
  if (status !== 'pending') return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Compare only by date
  
  const leaveEnd = new Date(endDate);
  leaveEnd.setHours(0, 0, 0, 0);

  return today > leaveEnd;
};

export default function DoctorLeaveManagement() {
  const [leaves, setLeaves] = useState<IDoctorLeave[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<IDoctorLeave | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 5;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await hospitalApi.getLeaveFromDoctor({
        page: currentPage,
        limit,
        search: searchQuery,
        date: filterDate
      });

      if (response?.data?.success) {
        setLeaves(response.data.data || []);
        const pagination = response.data.pagination;
        setTotalItems(pagination?.totalItems || 0);
        setTotalPages(pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch leaves", error);
      toast.error("Failed to load leave requests");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, filterDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side filtering with expiry logic
  const processedLeaves = leaves.map(leave => ({
    ...leave,
    isExpired: isLeaveExpired(leave.endDate, leave.status)
  }));

  const filtered = processedLeaves.filter(leave => {
    if (filter === 'all') return true;
    if (filter === 'expired') return leave.isExpired;
    if (filter === 'pending') return !leave.isExpired && leave.status === 'pending';
    return leave.status === filter;
  });

  const handleLeaveResponse = async (status: 'approved' | 'rejected', reason?: string) => {
    if (!selectedLeave) return;

    try {
      const response = await hospitalApi.updateLeaveStatus(selectedLeave.id, {
        status,
        rejectedReason: reason
      });

      if (response.data.success) {
        toast.success(`Leave ${status} successfully`);
        fetchData(); // Refresh to reflect changes
        setShowRejectModal(false);
        setShowDetailModal(false);
        setSelectedLeave(null);
        setRejectReason('');
      }
    } catch (error) {
      console.error("Failed to update leave status", error);
      toast.error("Failed to update leave status");
    }
  };

  // Stats calculations
  const pendingCount = processedLeaves.filter(l => !l.isExpired && l.status === 'pending').length;
  const approvedCount = processedLeaves.filter(l => l.status === 'approved').length;
  const rejectedCount = processedLeaves.filter(l => l.status === 'rejected').length;
  const expiredCount = processedLeaves.filter(l => l.isExpired).length;

  const stats = [
  {
    label: "Total Requests",
    value: totalItems,
    icon: Users,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
  {
    label: "Pending Review",
    value: pendingCount,
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-100/50",
  },
  {
    label: "Approved Leaves",
    value: approvedCount,
    icon: UserCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-100/50",
  },
  {
    label: "Rejected",
    value: rejectedCount,
    icon: FileWarning,
    color: "text-rose-600",
    bg: "bg-rose-100/50",
  },
  {
    label: "Expired",
    value: expiredCount,
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-100/50",
  },
];
const getFilterCount = (key: string): number => {
  switch (key) {
    case "pending":
      return pendingCount;
    case "approved":
      return approvedCount;
    case "rejected":
      return rejectedCount;
    case "expired":
      return expiredCount;
    default:
      return 0;
  }
};

type LeaveColumnKey =
  | "doctor"
  | "period"
  | "session"
  | "reason"
  | "status"
  | "action";

const tableColumns: TableColumn<LeaveColumnKey>[] = [
  { key: "doctor", label: "Doctor Details" },
  { key: "period", label: "Leave Period" },
  { key: "session", label: "Session" },
  { key: "reason", label: "Reason" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action" },
];

const renderRow = (leave: IDoctorLeave & { isExpired: boolean }) => {
  const session = leave.leaveSession ? sessionConfig[leave.leaveSession] : null;
  const SessionIcon = session?.icon;
  const isExpired = leave.isExpired;

  return (
    <>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <img
            src={leave.doctorId.profileImage}
            alt={leave.doctorId.name}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all"
          />
          <div>
            <div className="text-sm font-bold text-slate-900 uppercase">
              Dr. {leave.doctorId.name}
            </div>
            <div className="text-xs text-slate-400 font-bold">{leave.doctorId.email}</div>
            <div className="text-xs text-slate-400 font-bold uppercase">{leave.doctorId.department}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <CalendarDays className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{formatDate(leave.startDate)}</span>
        </div>
        <div className="text-xs text-slate-400 font-bold mt-1 ml-6">
          to {formatDate(leave.endDate)}
        </div>
        <div className="text-xs text-blue-500 font-bold mt-1 ml-6">{getDuration(leave.startDate, leave.endDate)}</div>
      </td>

      <td className="px-6 py-4">
        {session && SessionIcon ? (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${session.bg} ${session.color} ${session.border}`}
          >
            <SessionIcon className="w-3.5 h-3.5" />
            {session.label}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Full Day</span>
        )}
      </td>

      <td className="px-6 py-4 max-w-[200px]">
        <p className="text-xs text-slate-600 font-medium line-clamp-2">{leave.reason || "—"}</p>
      </td>

      <td className="px-6 py-4">{getStatusBadge(leave.status, leave.endDate)}</td>

      <td className="px-6 py-4">
        <button
          onClick={() => {
            setSelectedLeave(leave);
            setShowDetailModal(true);
          }}
          className="flex items-center gap-2 text-blue-600 hover:text-white text-xs font-bold bg-blue-50 hover:bg-blue-600 px-3 py-2 rounded-lg transition-all shadow-sm"
        >
          <Eye className="w-4 h-4" />
          Review
        </button>
      </td>
    </>
  );
};

type FilterType = "all" | "pending" | "approved" | "rejected" | "expired";

const filterTabs: { key: FilterType; label: string }[] = [
  { key: "all", label: "All Requests" },
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "expired", label: "Expired" },
];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctor Leave Management</h1>
            <p className="text-slate-500 mt-1">Review and manage doctor leave applications with expiry tracking.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 shadow-sm transition-all"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full shadow-sm"
              />
              {filterDate && (
                <button
                  onClick={() => { setFilterDate(''); setCurrentPage(1); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
<StatsCards stats={stats} />

       <FilterTabs
  tabs={filterTabs}
  activeFilter={filter}
  onFilterChange={(key: string) => {
    setFilter(key as FilterType);
  }}
  getCount={getFilterCount}
/>

      {/* Table */}
<div className="mb-6">
  <DataTable
    data={filtered}
    columns={tableColumns}
    renderRow={renderRow}
    isLoading={isLoading}
    emptyState={{
      title: "No leave requests found",
      message: "Try adjusting your filters or search query.",
      icon: <Search className="w-8 h-8 text-slate-300" />,
    }}
  />

  {totalPages > 1 && (
    <div className="flex justify-center py-6 border-t border-slate-100">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )}
</div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLeave && (
        <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 uppercase">Leave Application Review</h2>
              </div>
              <button 
                onClick={() => { setShowDetailModal(false); setSelectedLeave(null); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Doctor Info */}
              <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <img 
                  src={selectedLeave.doctorId.profileImage} 
                  alt={selectedLeave.doctorId.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg" 
                />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                    <p className="text-slate-900 font-bold uppercase">Dr. {selectedLeave.doctorId.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                    <p className="text-slate-700 font-bold text-sm">{selectedLeave.doctorId.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Department</label>
                    <p className="text-slate-900 font-bold uppercase">{selectedLeave.doctorId.department}</p>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-tight">Leave Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                    <label className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">Start Date</label>
                    <p className="text-slate-900 font-bold">{formatDate(selectedLeave.startDate)}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                    <label className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">End Date</label>
                    <p className="text-slate-900 font-bold">{formatDate(selectedLeave.endDate)}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                    <label className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">Duration</label>
                    <p className="text-slate-900 font-bold">{getDuration(selectedLeave.startDate, selectedLeave.endDate)}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                    <label className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">Session</label>
                    {selectedLeave.leaveSession ? (() => {
                      const s = sessionConfig[selectedLeave.leaveSession];
                      const Icon = s.icon;
                      return <span className={`inline-flex items-center gap-1 font-bold text-sm ${s.color}`}><Icon className="w-4 h-4" />{s.label}</span>;
                    })() : <span className="text-slate-400 font-bold">Full Day</span>}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 uppercase tracking-tight">Leave Reason</h3>
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                  <p className="text-slate-700 font-medium leading-relaxed">{selectedLeave.reason || 'No reason provided.'}</p>
                </div>
              </div>

              {/* Supporting Document */}
              {selectedLeave.photo && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3 uppercase tracking-tight">Supporting Document</h3>
                  <div 
                    className="group relative cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden hover:border-blue-400 transition-all bg-slate-50"
                    onClick={() => setShowZoomModal(true)}
                  >
                    <img 
                      src={selectedLeave.photo} 
                      alt="Supporting Document"
                      className="w-full h-64 object-contain p-4 group-hover:scale-[1.02] transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                      <div className="p-3 bg-white rounded-full shadow-xl"><Eye className="w-6 h-6" /></div>
                      <span className="text-white font-bold text-sm uppercase">Click to magnify</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedLeave.status === 'rejected' && selectedLeave.rejectedReson && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                  <label className="text-xs font-bold text-rose-500 uppercase tracking-wider block mb-2">Rejection Reason</label>
                  <p className="text-rose-700 font-medium">{selectedLeave.rejectedReson}</p>
                </div>
              )}

              {/* Status */}
              <div className="pt-4">
                {getStatusBadge(selectedLeave.status, selectedLeave.endDate)}
              </div>

              {/* Action Buttons */}
              {selectedLeave.status === 'pending' && !isLeaveExpired(selectedLeave.endDate, selectedLeave.status) && (
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleLeaveResponse('approved')}
                    className="flex-1 bg-emerald-600 text-white px-8 py-4 rounded-2xl hover:bg-emerald-700 font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 uppercase text-sm tracking-wider"
                  >
                    <CheckCircle className="w-5 h-5" /> Approve Leave
                  </button>
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 bg-rose-600 text-white px-8 py-4 rounded-2xl hover:bg-rose-700 font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 active:scale-95 uppercase text-sm tracking-wider"
                  >
                    <XCircle className="w-5 h-5" /> Reject Leave
                  </button>
                </div>
              )}

              {isLeaveExpired(selectedLeave.endDate, selectedLeave.status) && (
                <div className="flex items-center justify-center gap-3 py-8 text-amber-700 font-bold text-lg bg-amber-50 rounded-2xl border border-amber-100 uppercase tracking-widest">
                  <AlertTriangle className="w-7 h-7" /> This leave request has expired
                </div>
              )}

              {selectedLeave.status === 'approved' && (
                <div className="flex items-center justify-center gap-3 py-8 text-emerald-700 font-bold text-lg bg-emerald-50 rounded-2xl border border-emerald-100 uppercase tracking-widest">
                  <CheckCircle className="w-7 h-7" /> Leave Approved
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedLeave && (
        <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Reject Leave Request</h3>
                <p className="text-sm text-slate-500">Provide a reason for Dr. {selectedLeave.doctorId.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-tight">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Explain why this leave request is being rejected..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all min-h-[130px] resize-none text-slate-600 font-medium"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="flex-1 bg-slate-100 text-slate-700 px-6 py-3.5 rounded-2xl hover:bg-slate-200 font-bold transition-all uppercase text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleLeaveResponse('rejected', rejectReason)} 
                disabled={!rejectReason.trim()}
                className="flex-1 bg-rose-600 text-white px-6 py-3.5 rounded-2xl hover:bg-rose-700 font-bold transition-all shadow-lg shadow-rose-600/20 uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {showZoomModal && selectedLeave?.photo && (
        <div 
          className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[70] p-4 cursor-zoom-out"
          onClick={() => setShowZoomModal(false)}
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button 
              onClick={() => setShowZoomModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-blue-400 transition-colors"
            >
              <XCircle className="w-10 h-10" />
            </button>
            <img 
              src={selectedLeave.photo} 
              alt="Document Full View"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border-4 border-white/10"
              onClick={e => e.stopPropagation()} 
            />
            <button 
              onClick={() => setShowZoomModal(false)}
              className="mt-6 bg-white/10 text-white px-8 py-3.5 rounded-2xl hover:bg-white/20 font-bold transition-all border border-white/20 uppercase text-sm tracking-widest"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}