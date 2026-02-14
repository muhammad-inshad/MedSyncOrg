import { useState } from 'react';
import { Search, Bell, Settings, User, MessageSquare, FileText, Phone } from 'lucide-react';
import DoctorDashbord from '../../../assets/images/DoctorDashbord.png'
import api from '@/lib/api';
import toast from 'react-hot-toast';
const DoctorDashboard = () => {
  const [appointments] = useState([
    { id: 1, name: 'John Smith', time: '9:00 AM', status: 'Confirmed' },
    { id: 2, name: 'Emily Jones', time: '9:30 AM', status: 'Confirmed' },
    { id: 3, name: 'Michael Williams', time: '10:00 AM', status: 'Pending' },
    { id: 4, name: 'Sarah Brown', time: '10:15 AM', status: 'Canceled' }
  ]);

  const [earningsData] = useState([120, 150, 130, 180, 280, 310, 290]);

  const getStatusColor = (status: unknown) => {
    switch (status) {
      case 'Confirmed': return 'text-green-600';
      case 'Pending': return 'text-yellow-600';
      case 'Canceled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleLogout = async () => {
  try {
   
    await api.post('/api/auth/logout'); 
   
    localStorage.removeItem('role');
    toast.success("logout success")
    window.location.href = '/login/doctor';
  } catch (error) {
    console.error("Logout failed", error);
  }
};

  const maxEarning = Math.max(...earningsData);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-800">MedSync</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-900 font-medium">Home</a>
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
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                Start Consultation
              </button>
              <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
              <Settings className="w-6 h-6 text-gray-600 cursor-pointer" />
              <div onClick={handleLogout} className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer">
                <User className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" >
        {/* Hero Section */}
        <div
          className="rounded-xl overflow-hidden mb-8 relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${DoctorDashbord})` }}
        >
          <div className="absolute inset-0 bg-black opacity-10" ></div>
          <div className="relative px-8 py-16">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Doctor Dashboard</h1>
            <p className="text-gray-700 mb-6 max-w-md">
              Welcome back, Dr. Anya Sharma. Manage your appointments, patients, and earnings all in one place.
            </p>
            <div className="flex space-x-4">
              <button className="px-6 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition">
                mange appointments
              </button>
              <button className="px-6 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition">
                apply for leave
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Patient Name</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Time</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-4 px-4 text-gray-800">{appointment.name}</td>
                        <td className="py-4 px-4 text-gray-600">{appointment.time}</td>
                        <td className={`py-4 px-4 font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </td>
                        <td className="py-4 px-4">
                          <button className="text-blue-500 hover:text-blue-600">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wallet/Earnings */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Wallet / Earnings</h3>
                <p className="text-sm text-gray-500 mb-4">This month's earnings so far.</p>
                <div className="text-3xl font-bold text-gray-800 mb-4">12,450.75</div>
                <div className="flex items-end space-x-1 h-32">
                  {earningsData.map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-blue-400 rounded-t"
                      style={{ height: `${(value / maxEarning) * 100}%` }}
                    ></div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <button className="w-full py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    wallet
                  </button>
                </div>
              </div>

              {/* Chat & Lab Results */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Chat & Lab Results</h3>
                <p className="text-sm text-gray-500 mb-4">Access patient chats and view lab results.</p>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Patient Chat</span>
                  </button>
                  <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>View Lab Results</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Start Consultation */}
            <div className="bg-blue-500 rounded-xl shadow-sm p-6 text-center">
              <button className="w-full py-3 bg-white text-blue-500 rounded-lg hover:bg-gray-100 transition font-semibold text-lg">
                Start Consultation
              </button>
            </div>

            {/* Live Token Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Token Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Now Serving</p>
                  <p className="text-3xl font-bold text-blue-500">A-102</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Patient</p>
                  <p className="text-3xl font-bold text-gray-800">A-103</p>
                </div>
              </div>
            </div>

            {/* Need Assistance */}
            <div className="bg-indigo-900 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Need Assistance?</h3>
              <p className="text-sm text-indigo-200 mb-4">
                Get in touch with our support team for any queries or issues.
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 mt-1" />
                  <div>
                    <p className="font-medium">IT Support</p>
                    <p className="text-sm text-indigo-200">support@medsync.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 mt-1" />
                  <div>
                    <p className="font-medium">Emergency Line</p>
                    <p className="text-sm text-indigo-200">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-2 bg-white text-indigo-900 rounded-lg hover:bg-gray-100 transition font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">MEDDICAL</h3>
              <p className="text-indigo-200 text-sm">
                Leading the Way in Medical Excellence, Trusted Care.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Important Links</h4>
              <ul className="space-y-2 text-indigo-200 text-sm">
                <li><a href="#" className="hover:text-white">Appointment</a></li>
                <li><a href="#" className="hover:text-white">Doctors</a></li>
                <li><a href="#" className="hover:text-white">Services</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-indigo-200 text-sm">
                <li>Call: (237) 681-812-255</li>
                <li>Email: fildineesoe@gmail.com</li>
                <li>Address: 0123 Some place</li>
                <li>Some country</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-2 rounded-l-lg text-gray-800 focus:outline-none"
                />
                <button className="px-4 py-2 bg-blue-500 rounded-r-lg hover:bg-blue-600">
                  →
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-indigo-800 mt-8 pt-8 flex justify-between items-center">
            <p className="text-sm text-indigo-200">© 2021 Hospital's name All Rights Reserved by PNTEC-LTD</p>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 bg-indigo-800 rounded-full flex items-center justify-center hover:bg-indigo-700">in</a>
              <a href="#" className="w-8 h-8 bg-indigo-800 rounded-full flex items-center justify-center hover:bg-indigo-700">f</a>
              <a href="#" className="w-8 h-8 bg-indigo-800 rounded-full flex items-center justify-center hover:bg-indigo-700">@</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DoctorDashboard;