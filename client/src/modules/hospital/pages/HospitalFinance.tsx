import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  DollarSign,
  AlertCircle,
  Eye,
  Wallet,
  BadgeCheck,
  BarChart3,
} from 'lucide-react';

import { DataTable, type TableColumn } from '../components/tables/DataTable';
import { FilterTabs } from '../components/tables/FilterTabs';
import { StatsCards } from '../components/tables/StatsCards';
import Pagination from '@/components/Pagination';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

import { hospitalApi } from '@/constants/backend/hospital/hospital.api';

// ─── Interfaces ─────────────────────────────────────────────────────────────
interface DoctorInfo {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  department?: string;
}

interface RawSalaryRequest {
  _id: string;
  currentAmount: number;
  requestedAmount: number;
  reason: string;
  status: string;
  createdAt: string;
  doctorId?: DoctorInfo;
  approvedAmount?: number;
  approvalNote?: string;
}

interface SalaryRequest {
  id: string;
  doctorId: string;
  name: string;
  email?: string;
  department?: string;
  profileImage: string;
  currentSalary: number;
  requestedSalary: number;
  requestReason: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedSalary?: number;
  approvalNote?: string;
}

interface UpdateSalaryPayload {
  status: 'APPROVED' | 'REJECTED';
  doctorId: string;
  note: string;
  approvedAmount?: number;
  hospitalCommission?: number;
}

// ─── Utilities ───────────────────────────────────────────────────────────────
const fmt = (n: number): string => `₹${n.toLocaleString('en-IN')}`;

const StatusBadge = ({ status }: { status: SalaryRequest['status'] }) => {
  const styles: Record<SalaryRequest['status'], string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  const labels: Record<SalaryRequest['status'], string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const HospitalFinance = () => {
  const [requests, setRequests] = useState<SalaryRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selected, setSelected] = useState<SalaryRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [commission, setCommission] = useState('');
  const [note, setNote] = useState('');
  const [modalError, setModalError] = useState('');

  // ─── Transform Raw Data ───────────────────────────────────────────────────
  const transformRequest = useCallback((item: RawSalaryRequest): SalaryRequest => {
    const doctor = item.doctorId || {};

    return {
      id: item._id,
      doctorId: doctor._id || doctor.id || '',
      name: doctor.name || 'Unknown Doctor',
      email: doctor.email,
      department: doctor.department,
      profileImage: doctor.profileImage || '',
      currentSalary: item.currentAmount || 0,
      requestedSalary: item.requestedAmount || 0,
      requestReason: item.reason || '',
      submittedAt: item.createdAt,
      status: (item.status.toLowerCase() as SalaryRequest['status']) || 'pending',
      approvedSalary: item.approvedAmount,
      approvalNote: item.approvalNote,
    };
  }, []);

  // ─── Fetch Data ───────────────────────────────────────────────────────────
  const fetchSalaryRequests = useCallback(
    async (page: number = 1, statusFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all') => {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = {
          page,
          limit: 10,
        };

        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        if (search.trim()) {
          params.search = search.trim();
        }

        const res = await hospitalApi.getdoctorsalaryrequest(params);
        const rawData: RawSalaryRequest[] = res.data?.data || [];

        const transformedData = rawData.map(transformRequest);

        setRequests(transformedData);
        setTotalPages(res.data?.pagination?.totalPages || 1);
        setTotalRequests(res.data?.pagination?.totalItems || rawData.length);
        setCurrentPage(page);
      } catch (error) {
        console.error('Error fetching salary requests:', error);
        setRequests([]);
        setTotalPages(1);
        setTotalRequests(0);
        toast.error('Failed to load salary requests');
      } finally {
        setIsLoading(false);
      }
    },
    [search, transformRequest]
  );

  // Debounced search + filter effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSalaryRequests(1, filter);
    }, search.trim() ? 500 : 0);

    return () => clearTimeout(timeout);
  }, [search, filter, fetchSalaryRequests]);

  // ─── Modal Handlers ───────────────────────────────────────────────────────
  const openModal = (req: SalaryRequest) => {
    setSelected(req);
    setApprovedAmount(req.requestedSalary.toString());
    setCommission('');
    setNote(req.approvalNote || '');
    setModalError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
    setApprovedAmount('');
    setCommission('');
    setNote('');
    setModalError('');
  };

  // ─── Handle Approve / Reject ──────────────────────────────────────────────
  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!selected) return;

    // Validation
    if (action === 'approved') {
      const val = parseFloat(approvedAmount);
      const commissionVal = parseFloat(commission);

      if (!approvedAmount || isNaN(val) || val <= selected.currentSalary) {
        setModalError('Approved salary must be greater than current salary.');
        return;
      }

      if (!commission || isNaN(commissionVal) || commissionVal < 0 || commissionVal > 100) {
        setModalError('Commission must be between 0 and 100.');
        return;
      }

      if (!note.trim()) {
        setModalError('Please provide an approval note.');
        return;
      }
    } else if (!note.trim()) {
      setModalError('Please provide a rejection reason.');
      return;
    }

    try {
      setIsLoading(true);

      const payload: UpdateSalaryPayload = {
        status: action === 'approved' ? 'APPROVED' : 'REJECTED',
        doctorId: selected.doctorId,
        note: note.trim(),
      };

      if (action === 'approved') {
        payload.approvedAmount = parseFloat(approvedAmount);
        payload.hospitalCommission = parseFloat(commission);
      }

      const res = await hospitalApi.updateSalaryRequestStatus(selected.id, payload);

      if (res.data?.success) {
        toast.success(`Request ${action} successfully!`);
        closeModal();
        fetchSalaryRequests(currentPage, filter);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error.response?.data?.message || 'Failed to update request.';
      setModalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = [
    {
      label: 'Total Requests',
      value: totalRequests,
      icon: Users,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
    },
    {
      label: 'Pending Review',
      value: requests.filter((r) => r.status === 'pending').length,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      label: 'Approved',
      value: requests.filter((r) => r.status === 'approved').length,
      icon: BadgeCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
  ];

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const columns: TableColumn[] = [
    { key: 'doctor', label: 'Doctor' },
    { key: 'currentSalary', label: 'Current Salary' },
    { key: 'requested', label: 'Requested' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' },
  ];

  const renderRow = (req: SalaryRequest) => (
    <>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={req.profileImage || 'https://i.pravatar.cc/150?img=60'}
            alt={req.name}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?img=60';
            }}
          />
          <div>
            <div className="font-bold text-slate-900 text-sm">Dr. {req.name}</div>
            {req.email && <div className="text-xs text-slate-400">{req.email}</div>}
            {req.department && <div className="text-xs text-slate-500">{req.department}</div>}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-bold text-slate-700 tabular-nums">{fmt(req.currentSalary)}</td>
      <td className="px-6 py-4 font-bold text-blue-600 tabular-nums">{fmt(req.requestedSalary)}</td>
      <td className="px-6 py-4">
        <StatusBadge status={req.status} />
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => openModal(req)}
          className="flex items-center gap-1.5 text-blue-600 hover:text-white text-xs font-bold bg-blue-50 hover:bg-blue-600 px-3 py-2 rounded-lg transition-all shadow-sm"
        >
          <Eye className="w-4 h-4" />
          {req.status === 'pending' ? 'Review' : 'View'}
        </button>
      </td>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Wallet className="w-8 h-8 text-blue-600" />
              Finance & Salary Management
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Review and manage doctor salary increment requests
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name..."
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full text-sm"
            />
          </div>
        </div>

        <StatsCards stats={stats} />

        <FilterTabs
          tabs={filterTabs}
          activeFilter={filter}
          onFilterChange={(key) => setFilter(key as typeof filter)}
          getCount={(key) =>
            key === 'all' ? totalRequests : requests.filter((r) => r.status === key).length
          }
        />

        <DataTable<SalaryRequest>
          data={requests}
          columns={columns}
          renderRow={renderRow}
          isLoading={isLoading}
          emptyState={{
            title: 'No salary requests found',
            message: 'Try adjusting your search or filter.',
            icon: <BarChart3 className="w-10 h-10 text-slate-200 mx-auto" />,
          }}
        />

        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchSalaryRequests(page, filter)}
          />
        )}
      </div>

      {/* Salary Review Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col" style={{ maxHeight: '92vh' }}>
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white border-b border-slate-100 px-7 py-5 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Salary Review</h2>
                  <p className="text-xs text-slate-400">Dr. {selected.name}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-7 space-y-6">
              {/* Doctor Info */}
              <div className="flex items-center gap-5 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <img
                  src={selected.profileImage || 'https://i.pravatar.cc/150?img=60'}
                  alt={selected.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?img=60';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xl truncate">Dr. {selected.name}</div>
                  {selected.email && <div className="text-slate-500 text-sm">{selected.email}</div>}
                  {selected.department && <div className="text-slate-600 text-sm mt-1">{selected.department}</div>}
                </div>
              </div>

              {/* Salary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Current Salary</div>
                  <div className="text-xl font-bold text-slate-700 tabular-nums">{fmt(selected.currentSalary)}</div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                  <div className="text-xs font-bold text-blue-400 uppercase mb-1">Requested Salary</div>
                  <div className="text-xl font-bold text-blue-700 tabular-nums">{fmt(selected.requestedSalary)}</div>
                </div>
              </div>

              {/* Request Reason */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Request Reason
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-slate-700 text-sm leading-relaxed">
                  {selected.requestReason || 'No reason provided.'}
                </div>
              </div>

              {/* Action Section */}
              {selected.status === 'pending' ? (
                <div className="space-y-5 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Approved Doctor Fee (₹) <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          value={approvedAmount}
                          onChange={(e) => setApprovedAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800"
                          placeholder="2500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Hospital Commission (%) <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                        <input
                          type="number"
                          value={commission}
                          onChange={(e) => setCommission(e.target.value)}
                          min={0}
                          max={100}
                          className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800"
                          placeholder="20"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Admin Note / Reason <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Explain your decision..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none min-h-[100px] text-sm"
                    />
                  </div>

                  {modalError && (
                    <div className="flex items-center gap-2 text-rose-600 text-sm font-semibold bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4" />
                      {modalError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleAction('approved')}
                      disabled={isLoading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Increment
                    </button>

                    <button
                      onClick={() => handleAction('rejected')}
                      disabled={isLoading}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Request
                    </button>
                  </div>
                </div>
              ) : (
                /* Processed Request View */
                <div
                  className={`rounded-2xl border p-5 space-y-3 ${
                    selected.status === 'approved'
                      ? 'bg-emerald-50 border-emerald-100'
                      : 'bg-rose-50 border-rose-100'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 font-bold text-lg uppercase tracking-wide ${
                      selected.status === 'approved' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {selected.status === 'approved' ? (
                      <>
                        <CheckCircle className="w-6 h-6" /> Increment Approved
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6" /> Request Rejected
                      </>
                    )}
                  </div>

                  {selected.approvedSalary && (
                    <div className="flex justify-between text-sm bg-white/60 rounded-xl px-4 py-3 border border-white">
                      <span className="text-slate-500">Approved Doctor Fee</span>
                      <span className="font-bold text-emerald-600">{fmt(selected.approvedSalary)}</span>
                    </div>
                  )}

                  {selected.approvalNote && (
                    <div className="text-sm text-slate-600 bg-white/60 rounded-xl px-4 py-3 border border-white">
                      {selected.approvalNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalFinance;