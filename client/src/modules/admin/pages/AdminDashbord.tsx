import type { LucideIcon } from 'lucide-react';

import {
  Users,
  Search,
  ChevronDown,
  Stethoscope,
  Menu,
} from 'lucide-react';
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

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    totalPatients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/admin/dashboard-stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard icon={Stethoscope} color="blue" title="Doctors" value={loading ? "..." : stats.totalDoctors.toString()} />
            <StatCard icon={Users} color="green" title="Patients" value={loading ? "..." : stats.totalPatients.toString()} />
            <StatCard icon={Stethoscope} color="green" title="Active Staff" value={loading ? "..." : stats.activeDoctors.toString()} />
            {/* Add more cards later: Appointments, Revenue, etc. */}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">Hospital Performance</h2>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm w-full sm:w-auto">
                  This Month <ChevronDown size={16} />
                </button>
              </div>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      stroke="#9ca3af"
                      fontSize={11}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={11}
                      tick={{ fontSize: 11 }}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px' }}
                      iconSize={12}
                    />
                    <Line
                      type="monotone"
                      dataKey="Appointments"
                      stroke="#d97706"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Patients"
                      stroke="#0369a1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Finance Chart */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">Income Distribution</h2>
              </div>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer>
                  <BarChart data={financeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="range"
                      stroke="#9ca3af"
                      fontSize={11}
                      tick={{ fontSize: 11 }}
                    />
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
                    <Tooltip
                      contentStyle={{ fontSize: '12px' }}
                    />
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

export default AdminDashboard;