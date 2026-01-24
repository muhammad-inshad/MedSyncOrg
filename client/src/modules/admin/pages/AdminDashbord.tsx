import type { LucideIcon } from 'lucide-react';
import AdminSidbar from '../components/AdminSidbar'; 
import {
  Users,
  Search,
  ChevronDown,
  Stethoscope,
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

const AdminDashboard = () => {
  const performanceData = [
    { month: 'Jan', Appointments: 20, Patients: 15 },
    { month: 'Feb', Appointments: 35, Patients: 25 },
    { month: 'Mar', Appointments: 40, Patients: 30 },
    { month: 'Apr', Appointments: 45, Patients: 35 },
    { month: 'May', Appointments: 75, Patients: 50 },
    { month: 'Jun', Appointments: 120, Patients: 85 },
    { month: 'Jul', Appointments: 180, Patients: 140 },
  ];

  // Only income for now → removed expense legend confusion
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
      <AdminSidbar />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors, patients..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
              />
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Stethoscope} color="blue" title="Doctors" value="125" />
            <StatCard icon={Users} color="green" title="Patients" value="2,340" />
            {/* Add more cards later: Appointments, Revenue, etc. */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Hospital Performance</h2>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                  This Month <ChevronDown size={16} />
                </button>
              </div>
              <div className="h-80">
                <ResponsiveContainer>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Appointments"
                      stroke="#d97706"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Patients"
                      stroke="#0369a1"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Finance Chart */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Income Distribution</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer>
                  <BarChart data={financeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" stroke="#9ca3af" fontSize={12} />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={12}
                      label={{
                        value: 'Income (₹ thousands)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: 12 },
                      }}
                    />
                    <Tooltip />
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
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center space-x-4">
        <div className={`w-14 h-14 ${bg} rounded-full flex items-center justify-center`}>
          <Icon className={`w-7 h-7 ${text}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;