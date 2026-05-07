import { Building2, Hospital, TrendingUp, AlertCircle, Wallet, TrendingDown } from 'lucide-react';
import SuperAdminsidebar from '@/modules/superAdmin/components/SuperAdminsidebar';
import { useEffect, useState } from 'react';
import { superAdminApi } from '@/constants/backend/superAdmin/superAdmin.api';
import toast from 'react-hot-toast';
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

interface Transaction {
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  description: string;
}

interface ChartDataPoint {
  label: string;
  credit: number;
  debit: number;
  balance: number;
}

export default function SuperAdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    totalHospitals: 0,
    activeHospitals: 0,
    totalDoctors: 0,
    activeDoctors: 0,
    totalPatients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [walletSummary, setWalletSummary] = useState({
    balance: 0,
    totalEarnings: 0,
    totalWithdrawn: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await superAdminApi.getDashboardStats();
        if (response.data.success) {
          setDashboardStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    const fetchWallet = async () => {
      try {
        const response = await superAdminApi.getwallet();
        if (response.data.success) {
          const walletData = response.data.data;
          const transactions: Transaction[] = walletData.transactions || [];

          setWalletSummary({
            balance: walletData.balance ?? 0,
            totalEarnings: walletData.totalenrnings ?? 0,
            totalWithdrawn: walletData.totalwithdrawn ?? 0,
          });

          // Group transactions by date
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
        console.error('Failed to fetch wallet details', error);
        toast.error('Failed to load wallet details');
      }
    };

    fetchWallet();
    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Total Hospitals Managed',
      value: loading ? '...' : dashboardStats.totalHospitals.toString(),
      change: `Active: ${dashboardStats.activeHospitals}`,
      icon: Building2,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Subscriptions',
      value: loading ? '...' : dashboardStats.activeHospitals.toString(),
      change: '+5%',
      icon: null,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      indicator: 'green',
    },
   
    {
      label: 'Total Doctors',
      value: loading ? '...' : dashboardStats.totalDoctors.toString(),
      icon: null,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      indicator: 'green',
    },
    {
      label: 'Active Doctors',
      value: loading ? '...' : dashboardStats.activeDoctors.toString(),
      icon: null,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      indicator: 'green',
    },
    {
      label: 'Total Patients',
      value: loading ? '...' : dashboardStats.totalPatients.toString(),
      icon: null,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      indicator: 'green',
    },
  ];


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
          <p className="font-semibold text-gray-700 mb-2">{label}</p>
          {payload.map((entry: any) => (
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
    <div className="flex h-screen bg-gray-50">
      <SuperAdminsidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Overview of system status and recent activities.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className={`${stat.color || 'bg-blue-50'} p-3 rounded-lg`}>
                    {stat.icon ? (
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    ) : stat.indicator === 'green' ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    ) : stat.indicator === 'orange' ? (
                      <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    ) : (
                      <div className="w-6 h-6"></div>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-xs mb-2">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                 
                </div>
              </div>
            ))}
          </div>

          {/* Wallet Summary Mini Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Transaction Overview</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
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
                  <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                      width={55}
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
                      width={65}
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
        </div>
      </div>
    </div>
  );
}