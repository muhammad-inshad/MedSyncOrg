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
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { HOSPITAL_ROUTES } from '@/constants/frontend/hospital/hospital.routes';
import toast from 'react-hot-toast';
import { showToast } from '@/utils/toastUtils';

const HospitalDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalDoctors: 0,
        activeDoctors: 0,
        totalPatients: 0,
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
        fetchData();
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
        const diff = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const daysLeft = getDaysRemaining(subscription?.endDate);

    const performanceData = [
        { month: 'Jan', Appointments: 20, Patients: 15 },
        { month: 'Feb', Appointments: 35, Patients: 25 },
        { month: 'Mar', Appointments: 40, Patients: 30 },
        { month: 'Apr', Appointments: 45, Patients: 35 },
        { month: 'May', Appointments: 75, Patients: 50 },
        { month: 'Jun', Appointments: 120, Patients: 85 },
        { month: 'Jul', Appointments: 180, Patients: 140 },
    ];

    const financeData = [
        { range: '0-10', income: 150 },
        { range: '10-20', income: 250 },
        { range: '20-30', income: 180 },
        { range: '30-40', income: 320 },
        { range: '40-50', income: 280 },
        { range: '50-60', income: 450 },
        { range: '60-70', income: 310 },
        { range: '70-80', income: 420 },
        { range: '80-90', income: 180 },
        { range: '90+', income: 0 },
    ];

      const isSubscriptionActive = () => {
  if (!subscription) {
    return false;
  }

  const { status, endDate } = subscription;

  console.log("Status:", status);
  console.log("EndDate:", endDate);

  if (status !== "active") {
    console.log("Status not active");
    return false;
  }

  if (!endDate) {
    return false;
  }

  const today = new Date();
  const expiry = new Date(endDate);

  if (isNaN(expiry.getTime())) {
    console.log("Invalid date");
    return false;
  }

  return today <= expiry;
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
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Subscription</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 capitalize">
                                            {subscription?.plan || 'No Plan'}
                                        </p>
                                    </div>
                                </div>
                                {/* Status Badge */}
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    subscription?.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-600'
                                }`}>
                                    {subscription?.status || 'N/A'}
                                </span>
                            </div>

                            <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{formatDate(subscription?.startDate)} → {formatDate(subscription?.endDate)}</span>
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
    showToast.error("You can subscribe only after current plan expires");
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

                    {/* Charts */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold">Hospital Performance</h2>
                                <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm w-full sm:w-auto">
                                    This Month <ChevronDown size={16} />
                                </button>
                            </div>
                            <div className="h-64 sm:h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={performanceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tick={{ fontSize: 11 }} />
                                        <YAxis stroke="#9ca3af" fontSize={11} tick={{ fontSize: 11 }} width={40} />
                                        <Tooltip contentStyle={{ fontSize: '12px' }} />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} iconSize={12} />
                                        <Line type="monotone" dataKey="Appointments" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                                        <Line type="monotone" dataKey="Patients" stroke="#0369a1" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                            <div className="flex justify-between items-center mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold">Income Distribution</h2>
                            </div>
                            <div className="h-64 sm:h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={financeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="range" stroke="#9ca3af" fontSize={11} tick={{ fontSize: 11 }} />
                                        <YAxis
                                            stroke="#9ca3af"
                                            fontSize={11}
                                            tick={{ fontSize: 11 }}
                                            width={50}
                                            label={{
                                                value: 'Income (₹ thousands)',
                                                angle: -90,
                                                position: 'insideLeft',
                                                style: { fontSize: 11 },
                                            }}
                                        />
                                        <Tooltip contentStyle={{ fontSize: '12px' }} />
                                        <Bar dataKey="income" fill="#0891b2" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
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
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
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