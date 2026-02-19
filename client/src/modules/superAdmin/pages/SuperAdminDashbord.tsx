
import { Building2, Hospital, TrendingUp, AlertCircle } from 'lucide-react';
import SuperAdminsidebar from '@/modules/superAdmin/components/SuperAdminsidebar';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SuperAdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    totalHospitals: 0,
    activeHospitals: 0,
    totalDoctors: 0,
    activeDoctors: 0,
    totalPatients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/superadmin/dashboard-stats');
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

    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Total Hospitals Managed',
      value: loading ? '...' : dashboardStats.totalHospitals.toString(),
      change: `Active: ${dashboardStats.activeHospitals}`,
      icon: Building2,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Active Subscriptions',
      value: loading ? '...' : dashboardStats.activeHospitals.toString(), // Assuming active hospitals = active subscriptions for now
      change: '+5%',
      icon: null,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      indicator: 'green'
    },
    {
      label: 'Expiring Soon',
      value: '5', // Placeholder as backend doesn't support this yet
      change: 'Action',
      icon: null,
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      indicator: 'orange',
      alert: true
    },
    {
      label: 'Total Doctors',
      value: loading ? '...' : dashboardStats.totalDoctors.toString(),
      icon: null,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      indicator: 'green'
    },
    {
      label: 'Active Doctors',
      value: loading ? '...' : dashboardStats.activeDoctors.toString(),
      icon: null,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      indicator: 'green'
    },
    {
      label: 'Total Patients',
      value: loading ? '...' : dashboardStats.totalPatients.toString(),
      icon: null,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      indicator: 'green'
    }
  ];


  const activities = [
    {
      description: 'New Hospital Registered',
      date: 'Oct 24, 2023 10:30 AM',
      user: 'Admin User',
      status: 'Completed'
    }
  ];

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
                  {stat.change && (
                    <span className={`text-xs font-medium flex items-center gap-1 ${stat.alert ? 'text-red-600' : 'text-green-600'
                      }`}>
                      {stat.alert ? (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          {stat.change}
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          {stat.change}
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subscription Status Overview */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Subscription Status Overview</h2>
                <p className="text-sm text-gray-600">Distribution of hospital subscription statuses</p>
              </div>

              <div className="flex items-end justify-center gap-4 h-64 mb-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-32 bg-blue-600 rounded-t" style={{ height: '180px' }}></div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-32 bg-yellow-500 rounded-t" style={{ height: '140px' }}></div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-32 bg-gray-300 rounded-t" style={{ height: '80px' }}></div>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-1">TOTAL</p>
                <p className="text-4xl font-bold text-gray-900">42</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">60%</span>
                    <span className="text-xs text-gray-500">(25)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Expiring / Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">25%</span>
                    <span className="text-xs text-gray-500">(10)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-700">Inactive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">15%</span>
                    <span className="text-xs text-gray-500">(7)</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                View Report
              </button>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>

              <div className="mb-3">
                <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wide pb-3 border-b border-gray-200">
                  <div className="col-span-4">Activity Description</div>
                  <div className="col-span-3">Date/Time</div>
                  <div className="col-span-3">User</div>
                  <div className="col-span-2">Status</div>
                </div>
              </div>

              {activities.map((activity, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center py-4">
                  <div className="col-span-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Hospital className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-900 leading-tight">{activity.description}</span>
                  </div>
                  <div className="col-span-3 text-xs text-gray-600">{activity.date}</div>
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full shrink-0"></div>
                    <span className="text-xs text-gray-700">{activity.user}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}