import { useState, useEffect, useCallback } from 'react';
import { Search, User, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Wallet, TrendingDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

import { doctorApi } from '@/constants/backend/doctor/doctor.api';
import { Link, useNavigate } from 'react-router-dom';
import { DOCTOR_ROUTES } from '@/constants/frontend/doctor/doctor.routes';
import DoctorSidebar from '../components/DoctorSidebar';
import SalaryHikeRequestModal from '../components/SalaryHikeRequestModal';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SalaryHikeStatus {
  _id: string;
  status: string;
  requestedAmount: number;
  approvedAmount?: number;
  approvalNote?: string;
  rejectionReason?: string;
  createdAt: string;
}
interface TooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    color: string;
  }[];
  label?: string;
}
interface Transaction {
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  description?: string;
}

interface ChartDataPoint {
  label: string;
  credit: number;
  debit: number;
  balance: number;
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [latestRequest, setLatestRequest] = useState<SalaryHikeStatus | null>(null);
  const [isFetchingStatus, setIsFetchingStatus] = useState(true);

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [walletSummary, setWalletSummary] = useState({
    balance: 0,
    totalEarnings: 0,
    totalWithdrawn: 0,
  });

  const { user } = useSelector((state: RootState) => state.auth);

  const doctorId = user?.id;

  const fetchSalaryStatus = useCallback(async () => {
    if (!doctorId) return;
    try {
      setIsFetchingStatus(true);
      const res = await doctorApi.getSalaryIncreaseRequest(doctorId);
      if (res.data?.success) {
        setLatestRequest(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch salary status:', error);
    } finally {
      setIsFetchingStatus(false);
    }
  }, [doctorId]);

  const fetchWalletData = useCallback(async () => {
    try {
      const res = await doctorApi.getwallet();
      if (res.data?.success) {
        const walletData = res.data.data;

        const transactions: Transaction[] =
          walletData.Transaction ?? walletData.transactions ?? [];

        setWalletSummary({
          balance: walletData.balance ?? 0,
          totalEarnings: walletData.totalenrnings ?? 0,
          totalWithdrawn: walletData.totalwithdrawn ?? 0,
        });


        const grouped: Record<string, { credit: number; debit: number }> = {};
        transactions.forEach((txn) => {
          const dateKey = new Date(txn.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          });
          if (!grouped[dateKey]) grouped[dateKey] = { credit: 0, debit: 0 };
          if (txn.type === 'credit') grouped[dateKey].credit += txn.amount;
          else grouped[dateKey].debit += txn.amount;
        });

        // Build chart data with running balance
        let runningBalance = 0;
        const data: ChartDataPoint[] = Object.entries(grouped).map(([label, val]) => {
          runningBalance += val.credit - val.debit;
          return { label, credit: val.credit, debit: val.debit, balance: runningBalance };
        });

        setChartData(data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    }
  }, []);

  useEffect(() => {
    fetchSalaryStatus();
    fetchWalletData();
  }, [fetchSalaryStatus, fetchWalletData]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'APPROVED': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'REJECTED': return 'bg-rose-50 border-rose-200 text-rose-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'APPROVED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <TrendingUp className="w-5 h-5 text-gray-500" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
          <p className="font-semibold text-gray-700 mb-2">{label}</p>
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ background: entry.color }}
              />
              <span className="text-gray-600 capitalize">{entry.name}:</span>
              <span className="font-semibold text-gray-800">₹{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DoctorSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-8">
                <nav className="hidden md:flex space-x-8">
                  <Link to={DOCTOR_ROUTES.DOCTORDASHBOARD} className="text-gray-900 font-medium">
                    Home
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div
                  onClick={() => navigate(DOCTOR_ROUTES.DOCTORPROFILE)}
                  className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left / Centre — Wallet Section (spans 2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Wallet Summary Mini Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-11 h-11 bg-cyan-100 rounded-full flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Wallet Balance</p>
                    <p className="text-xl font-bold text-gray-900">₹{walletSummary.balance}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Earnings</p>
                    <p className="text-xl font-bold text-emerald-600">₹{walletSummary.totalEarnings}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-11 h-11 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                    <TrendingDown className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Withdrawn</p>
                    <p className="text-xl font-bold text-rose-600">₹{walletSummary.totalWithdrawn}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Transaction Overview</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Credits, debits and running balance over time
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
                      Credit
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" />
                      Debit
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-cyan-500 inline-block" />
                      Balance
                    </span>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="#9ca3af"
                        fontSize={11}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="amount"
                        stroke="#9ca3af"
                        fontSize={11}
                        tick={{ fontSize: 11 }}
                        width={50}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${v}`}
                      />
                      <YAxis
                        yAxisId="balance"
                        orientation="right"
                        stroke="#9ca3af"
                        fontSize={11}
                        tick={{ fontSize: 11 }}
                        width={60}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${v}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        yAxisId="amount"
                        dataKey="credit"
                        name="Credit"
                        fill="#34d399"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                      />
                      <Bar
                        yAxisId="amount"
                        dataKey="debit"
                        name="Debit"
                        fill="#fb7185"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                      />
                      <Line
                        yAxisId="balance"
                        type="monotone"
                        dataKey="balance"
                        name="Balance"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column — Salary Hike */}
            <div className="space-y-6">
              {!isFetchingStatus && latestRequest && (
                <div
                  className={`rounded-2xl border p-6 space-y-4 shadow-sm transition-all duration-300 ${getStatusColor(latestRequest.status)}`}
                >
                  <div className="flex items-center justify-between border-b border-black/5 pb-3">
                    <div className="flex items-center gap-2.5 font-bold uppercase tracking-wider text-xs">
                      {getStatusIcon(latestRequest.status)}
                      {latestRequest.status === 'PENDING'
                        ? 'Request Under Review'
                        : `Request ${latestRequest.status}`}
                    </div>
                    <span className="text-[10px] font-medium opacity-60 uppercase tracking-tighter">
                      {new Date(latestRequest.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-70 font-medium">Requested Hike:</span>
                      <span className="font-bold tabular-nums">
                        ₹{latestRequest.requestedAmount?.toLocaleString()}
                      </span>
                    </div>

                    {latestRequest.status === 'APPROVED' && latestRequest.approvedAmount && (
                      <div className="flex justify-between items-center text-sm p-2.5 bg-white/40 rounded-xl">
                        <span className="text-emerald-900/70 font-semibold italic">Final Approved:</span>
                        <span className="font-black text-emerald-800 tabular-nums">
                          ₹{latestRequest.approvedAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {(latestRequest.approvalNote || latestRequest.rejectionReason) && (
                      <div className="p-4 bg-white/50 rounded-xl text-xs leading-relaxed text-slate-700 italic border border-white/40 shadow-inner">
                        <span className="font-bold not-italic flex items-center gap-1.5 mb-1.5 text-[10px] uppercase tracking-wider opacity-70">
                          {latestRequest.status === 'REJECTED' ? (
                            <>
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                              Reason for Rejection:
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              Note from Management:
                            </>
                          )}
                        </span>
                        <p className="pl-4.5 border-l-2 border-black/5 ml-0.5">
                          "
                          {latestRequest.status === 'REJECTED'
                            ? latestRequest.rejectionReason
                            : latestRequest.approvalNote}
                          "
                        </p>
                      </div>
                    )}
                  </div>

                  {latestRequest.status === 'REJECTED' && (
                    <button
                      onClick={() => setShowSalaryModal(true)}
                      className="w-full py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <TrendingUp className="w-4 h-4" /> Re-request Salary Hike
                    </button>
                  )}
                </div>
              )}

              {(!latestRequest || latestRequest.status === 'APPROVED') && (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-600/20 p-8 text-center border border-blue-400/20">
                  <div className="mb-4 bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Grow Your Earnings</h3>
                  <p className="text-blue-100 text-xs mb-6 leading-relaxed">
                    Submit a request for a salary increment based on your performance.
                  </p>
                  <button
                    onClick={() => setShowSalaryModal(true)}
                    className="w-full py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold text-sm uppercase tracking-widest shadow-lg active:scale-[0.98]"
                  >
                    Request Salary Hike
                  </button>
                </div>
              )}

              {latestRequest?.status === 'PENDING' && (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-slate-100 flex flex-col items-center">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Processing Request</h3>
                  <p className="text-slate-500 text-sm mt-2 max-w-[200px]">
                    The management is currently reviewing your application.
                  </p>
                </div>
              )}

              <SalaryHikeRequestModal
                isOpen={showSalaryModal}
                onClose={() => {
                  setShowSalaryModal(false);
                  fetchSalaryStatus();
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;