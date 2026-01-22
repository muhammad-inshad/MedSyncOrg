import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Wallet, 
  RefreshCw, 
  Building2, 
  BadgeDollarSign, 
  UserCheck, 
  Umbrella, 
  User, 
  SquareStack, 
  Bell,
  LogOut,
  Search,
  ChevronDown,
  Stethoscope,
  UserPlus
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const performanceData = [
    { month: 'Jan', value1: 20, value2: 15 },
    { month: 'Feb', value1: 35, value2: 25 },
    { month: 'Mar', value1: 40, value2: 30 },
    { month: 'Apr', value1: 45, value2: 35 },
    { month: 'May', value1: 75, value2: 50 },
    { month: 'Jun', value1: 120, value2: 85 },
    { month: 'Jul', value1: 180, value2: 140 }
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
    { range: '90+', income: 0 }
  ];

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Stethoscope, label: 'Doctor Management' },
    { icon: UserPlus, label: 'Patient Management' },
    { icon: DollarSign, label: 'Finance' },
    { icon: Wallet, label: 'Payout Management' },
    { icon: RefreshCw, label: 'Return Payment' },
    { icon: Building2, label: 'Department' },
    { icon: BadgeDollarSign, label: 'Doctor salary inc' },
    { icon: UserCheck, label: 'Doctor Selection' },
    { icon: Umbrella, label: 'Doctor Leave Management' },
    { icon: User, label: 'Profile' },
    { icon: SquareStack, label: 'Cha' },
    { icon: Bell, label: 'subscription' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Admin Profile */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Admin</h3>
              <p className="text-xs text-gray-400">Hospital Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveMenu(item.label)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-sm transition ${
                activeMenu === item.label
                  ? 'bg-gray-800 border-l-4 border-blue-500'
                  : 'hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition">
            <LogOut className="w-5 h-5" />
            <span>Log-out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Doctor Count */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doctor Count</p>
                  <p className="text-3xl font-bold text-gray-900">125</p>
                </div>
              </div>
            </div>

            {/* Patient Count */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Patient Count</p>
                  <p className="text-3xl font-bold text-gray-900">2,340</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Performance Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Hospital Performance</h2>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <span className="text-sm text-gray-700">This Month</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'SR Related', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value1" 
                    stroke="#d97706" 
                    strokeWidth={2}
                    dot={{ fill: '#d97706', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value2" 
                    stroke="#0369a1" 
                    strokeWidth={2}
                    dot={{ fill: '#0369a1', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hospital Finance Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Hospital Finance</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Income</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Expense</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="range" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    label={{ 
                      value: 'Income (in Lacs thousand)', 
                      angle: -90, 
                      position: 'insideLeft', 
                      style: { fontSize: '12px' } 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="income" fill="#0891b2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;