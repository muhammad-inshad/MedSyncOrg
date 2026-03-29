import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Eye, Clock, CalendarDays, Users, FileWarning, UserCheck, Sun, Sunset, Moon, CloudSun, X } from 'lucide-react';
import { hospitalApi } from '@/constants/backend/hospital/hospital.api';
import { useAppSelector } from '@/hooks/redux';
import Pagination from '@/components/Pagination';
import toast from 'react-hot-toast';

interface IDoctorLeave {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    email: string;
    profileImage: string;
    specialization: string;
    department: string;
  };
  startDate: string;
  endDate: string;
  leaveSession?: 'morning' | 'afternoon' | 'evening' | 'night';
  reason?: string;
  photo?: string;
  rejectedReson?: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

// --- HELPERS ---
const sessionConfig = {
  morning: { icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100', label: 'Morning' },
  afternoon: { icon: CloudSun, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', label: 'Afternoon' },
  evening: { icon: Sunset, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', label: 'Evening' },
  night: { icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', label: 'Night' },
};

const getStatusBadge = (status: string) => {
  const map = {
    pending: { cls: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Pending Review' },
    approved: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Approved' },
    rejected: { cls: 'bg-rose-100 text-rose-700 border-rose-200', label: 'Rejected' },
  };
  const { cls, label } = map[status as keyof typeof map] || { cls: 'bg-gray-100 text-gray-600 border-gray-200', label: status };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>{label}</span>;
};

const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const getDuration = (start: string, end: string) => {
  const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  return `${diff} day${diff !== 1 ? 's' : ''}`;
};

// --- MAIN COMPONENT ---
export default function DoctorLeaveManagement() {
  const [leaves, setLeaves] = useState<IDoctorLeave[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<IDoctorLeave | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 5;

  const HospitalID = useAppSelector((state) => state.auth.user?._id);

  const fetchData = useCallback(async () => {
    if (!HospitalID) return;
    setIsLoading(true);
    try {
      const response = await hospitalApi.getLeaveFromDoctor(HospitalID as string, {
        page: currentPage,
        limit,
        search: searchQuery,
        date: filterDate
      });

      if (response?.data?.success) {
        setLeaves(response.data.data);
        const pagination = response.data.pagination;
        setTotalItems(pagination.totalItems);
        setTotalPages(pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch leaves", error);
    } finally {
      setIsLoading(false);
    }
  }, [HospitalID, currentPage, searchQuery, filterDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side filtering for status tabs
  const filtered = leaves.filter(l => filter === 'all' || l.status === filter);

  const handleLeaveResponse = async (status: 'approved' | 'rejected', reason?: string) => {
    if (!selectedLeave) return;
    try {
      const response = await hospitalApi.updateLeaveStatus(selectedLeave._id, {
        status,
        rejectedReason: reason
      });
      if (response.data.success) {
        toast.success(`Leave ${status} successfully`);
        setLeaves(prev => prev.map(l => l._id === selectedLeave._id ? { ...l, status, rejectedReson: reason } : l));
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

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctor Leave Management</h1>
            <p className="text-slate-500 mt-1">Review and manage doctor leave applications.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Requests', value: totalItems, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
            { label: 'Pending Review', value: totalItems > 0 ? leaves.filter(l => l.status === 'pending').length : 0, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100/50' },
            { label: 'Approved Leaves', value: totalItems > 0 ? leaves.filter(l => l.status === 'approved').length : 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
            { label: 'Rejected', value: totalItems > 0 ? leaves.filter(l => l.status === 'rejected').length : 0, icon: FileWarning, color: 'text-rose-600', bg: 'bg-rose-100/50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-all hover:shadow-md">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-8 inline-flex flex-wrap gap-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${filter === tab ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="capitalize">{tab}</span>
              {tab !== 'all' && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${filter === tab ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {leaves.filter(l => l.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table/List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 font-medium">Loading applications...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No leave requests found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Period</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Session</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(leave => {
                    const session = leave.leaveSession ? sessionConfig[leave.leaveSession] : null;
                    const SessionIcon = session?.icon;
                    return (
                      <tr key={leave._id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={leave.doctorId.profileImage} alt={leave.doctorId.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all" />
                            <div>
                              <div className="text-sm font-bold text-slate-900 uppercase">Dr. {leave.doctorId.name}</div>
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
                          <div className="text-xs text-slate-400 font-bold mt-1 ml-6">to {formatDate(leave.endDate)}</div>
                          <div className="text-xs text-blue-500 font-bold mt-1 ml-6">{getDuration(leave.startDate, leave.endDate)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {session && SessionIcon ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${session.bg} ${session.color} ${session.border}`}>
                              <SessionIcon className="w-3.5 h-3.5" />
                              {session.label}
                            </span>
                          ) : <span className="text-slate-400 text-xs">—</span>}
                        </td>
                        <td className="px-6 py-4 max-w-[200px]">
                          <p className="text-xs text-slate-600 font-medium line-clamp-2">{leave.reason || '—'}</p>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(leave.status)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => { setSelectedLeave(leave); setShowDetailModal(true); }}
                            className="flex items-center gap-2 text-blue-600 hover:text-white text-xs font-bold bg-blue-50 hover:bg-blue-600 px-3 py-2 rounded-lg transition-all shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>



      </div>

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
              <button onClick={() => { setShowDetailModal(false); setSelectedLeave(null); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <img src={selectedLeave.doctorId.profileImage} alt={selectedLeave.doctorId.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg" />
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
                      const s = sessionConfig[selectedLeave.leaveSession!];
                      const Icon = s.icon;
                      return <span className={`inline-flex items-center gap-1 font-bold text-sm ${s.color}`}><Icon className="w-4 h-4" />{s.label}</span>;
                    })() : <span className="text-slate-400 font-bold">Full Day</span>}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 uppercase tracking-tight">Leave Reason</h3>
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                  <p className="text-slate-700 font-medium leading-relaxed">{selectedLeave.reason || 'No reason provided.'}</p>
                </div>
              </div>

              {selectedLeave.photo && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3 uppercase tracking-tight">Supporting Document</h3>
                  <div className="group relative cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden hover:border-blue-400 transition-all bg-slate-50"
                    onClick={() => setShowZoomModal(true)}>
                    <img src={selectedLeave.photo} alt="Supporting Document"
                      className="w-full h-64 object-contain p-4 group-hover:scale-[1.02] transition-transform duration-500" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                      <div className="p-3 bg-white rounded-full shadow-xl"><Eye className="w-6 h-6" /></div>
                      <span className="text-white font-bold text-sm uppercase">Click to magnify</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedLeave.status === 'rejected' && selectedLeave.rejectedReson && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                  <label className="text-xs font-bold text-rose-500 uppercase tracking-wider block mb-2">Rejection Reason</label>
                  <p className="text-rose-700 font-medium">{selectedLeave.rejectedReson}</p>
                </div>
              )}

              <div>{getStatusBadge(selectedLeave.status)}</div>

              {selectedLeave.status === 'pending' && (
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                  <button onClick={() => handleLeaveResponse('approved')}
                    className="flex-1 bg-emerald-600 text-white px-8 py-4 rounded-2xl hover:bg-emerald-700 font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 uppercase text-sm tracking-wider">
                    <CheckCircle className="w-5 h-5" /> Approve Leave
                  </button>
                  <button onClick={() => setShowRejectModal(true)}
                    className="flex-1 bg-rose-600 text-white px-8 py-4 rounded-2xl hover:bg-rose-700 font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 active:scale-95 uppercase text-sm tracking-wider">
                    <XCircle className="w-5 h-5" /> Reject Leave
                  </button>
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
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-tight">Rejection Reason <span className="text-rose-500">*</span></label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Explain why this leave request is being rejected..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all min-h-[130px] resize-none text-slate-600 font-medium"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="flex-1 bg-slate-100 text-slate-700 px-6 py-3.5 rounded-2xl hover:bg-slate-200 font-bold transition-all uppercase text-sm">
                Cancel
              </button>
              <button onClick={() => handleLeaveResponse('rejected', rejectReason)} disabled={!rejectReason.trim()}
                className="flex-1 bg-rose-600 text-white px-6 py-3.5 rounded-2xl hover:bg-rose-700 font-bold transition-all shadow-lg shadow-rose-600/20 uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <XCircle className="w-5 h-5" /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {showZoomModal && selectedLeave?.photo && (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[70] p-4 cursor-zoom-out"
          onClick={() => setShowZoomModal(false)}>
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button onClick={() => setShowZoomModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-blue-400 transition-colors">
              <XCircle className="w-10 h-10" />
            </button>
            <img src={selectedLeave.photo} alt="Document Full View"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border-4 border-white/10"
              onClick={e => e.stopPropagation()} />
            <button onClick={() => setShowZoomModal(false)}
              className="mt-6 bg-white/10 text-white px-8 py-3.5 rounded-2xl hover:bg-white/20 font-bold transition-all border border-white/20 uppercase text-sm tracking-widest">
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}