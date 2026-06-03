import { hospitalApi } from '@/constants/backend/hospital/hospital.api';
import { useAppSelector } from '@/hooks/redux';
import type { HospitalProfile } from '@/store/auth/auth.type';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
    Users,
    Search,
    ChevronDown,
    Stethoscope,
    Menu,
    CreditCard,
    Calendar,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { HOSPITAL_ROUTES } from '@/constants/frontend/hospital/hospital.routes';
import { showToast } from '@/utils/toastUtils';

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

const HospitalDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalDoctors: 0,
        activeDoctors: 0,
        totalPatients: 0,
    });
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [walletSummary, setWalletSummary] = useState({
        balance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
    });

    const profile = useAppSelector((state) => state.auth.profileData);
    const subscription = (profile as HospitalProfile)?.subscription ?? null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await hospitalApi.getDashboardStats();
                setStats(result.data.data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchWalletData = async () => {
            try {
                const result = await hospitalApi.getwallet();
                const walletData = result.data.data;
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
            } catch (error) {
                console.error('Failed to fetch wallet data:', error);
            }
        };

        fetchData();
        fetchWalletData();
    }, []);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getDaysRemaining = (endDate?: string) => {
        if (!endDate) return 0;
        const diff = Math.ceil(
            (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return diff > 0 ? diff : 0;
    };

    const daysLeft = getDaysRemaining(subscription?.endDate);

    const isSubscriptionActive = () => {
        if (!subscription) return false;
        const { status, endDate } = subscription;
        if (status !== 'active') return false;
        if (!endDate) return false;
        const expiry = new Date(endDate);
        if (isNaN(expiry.getTime())) return false;
        return new Date() <= expiry;
    };

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
        <div className="flex h-screen bg-gray-100">
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    Hospital Dashboard
                                </h1>
                                <button className="sm:hidden p-2 hover:bg-gray-100 rounded-lg">
                                    <Menu className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    type="text"
                                    placeholder="Search doctors, patients..."
                                    className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72 text-sm sm:text-base"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <StatCard
                            icon={Stethoscope}
                            color="blue"
                            title="Total Doctors"
                            value={stats.totalDoctors.toString()}
                        />
                        <StatCard
                            icon={Users}
                            color="green"
                            title="Total Patients"
                            value={stats.totalPatients.toString()}
                        />
                        <StatCard
                            icon={Stethoscope}
                            color="green"
                            title="Active Staff"
                            value={stats.activeDoctors.toString()}
                        />

                        {/* Subscription Stat Card */}
                        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col justify-between">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                                        <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Subscription</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 capitalize">
                                            {subscription?.plan || 'No Plan'}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        subscription?.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-600'
                                    }`}
                                >
                                    {subscription?.status || 'N/A'}
                                </span>
                            </div>

                            <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                        {formatDate(subscription?.startDate)} →{' '}
                                        {formatDate(subscription?.endDate)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                    <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                                    <span className={daysLeft <= 7 ? 'text-red-500' : 'text-purple-600'}>
                                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (isSubscriptionActive()) {
                                        showToast.error('You can subscribe only after current plan expires');
                                        return;
                                    }
                                    navigate(HOSPITAL_ROUTES.HOSPITAL_SUBSCRIPTION);
                                }}
                                className="mt-3 w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                                Renew Plan
                            </button>
                        </div>
                    </div>

                    {/* Wallet Summary Mini Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                            <div className="w-11 h-11 bg-cyan-100 rounded-full flex items-center justify-center shrink-0">
                                <Wallet className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Wallet Balance</p>
                                <p className="text-xl font-bold text-gray-900">₹{walletSummary.balance}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                            <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Earnings</p>
                                <p className="text-xl font-bold text-emerald-600">₹{walletSummary.totalEarnings}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                            <div className="w-11 h-11 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                                <TrendingDown className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Withdrawn</p>
                                <p className="text-xl font-bold text-rose-600">₹{walletSummary.totalWithdrawn}</p>
                            </div>
                        </div>
                    </div>

                    {/* Single Transaction Chart */}
                    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                                    Transaction Overview
                                </h2>
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
                        <div className="h-72 sm:h-96">
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
                                        width={45}
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
                                        width={55}
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
            </main>
        </div>
    );
};

function StatCard({
    icon: Icon,
    color,
    title,
    value,
}: {
    icon: LucideIcon;
    color: string;
    title: string;
    value: string;
}) {
    const bg = color === 'blue' ? 'bg-blue-100' : 'bg-green-100';
    const text = color === 'blue' ? 'text-blue-600' : 'text-green-600';

    return (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
                <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 ${bg} rounded-full flex items-center justify-center shrink-0`}
                >
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${text}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">{title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}

export default HospitalDashboard;