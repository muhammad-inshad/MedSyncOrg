import { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarOff,
  Hash,
  MessageSquare,
  FileText,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  LogOut,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { DOCTOR_ROUTES } from '@/constants/frontend/doctor/doctor.routes';
import { authApi } from '@/constants/backend/auth/auth.api';
import toast from 'react-hot-toast';

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: DOCTOR_ROUTES.DOCTORDASHBOARD,
  },
  {
    label: 'Upcoming Appointments',
    icon: <CalendarCheck className="w-5 h-5" />,
    path: DOCTOR_ROUTES.UPCOMING_APPOINTMENTS, // e.g. '/doctor/appointments/upcoming'
  },

  {
    label: 'Apply for Leave',
    icon: <CalendarOff className="w-5 h-5" />,
    path: DOCTOR_ROUTES.APPLY_LEAVE, // e.g. '/doctor/leave'
  },
  {
    label: 'Manage Token',
    icon: <Hash className="w-5 h-5" />,
    path: DOCTOR_ROUTES.MANAGE_TOKEN, // e.g. '/doctor/token'
  },
  {
    label: 'Patient Chat',
    icon: <MessageSquare className="w-5 h-5" />,
    path: DOCTOR_ROUTES.PATIENT_CHAT, // e.g. '/doctor/chat'
  },
  {
    label: 'Lab Results',
    icon: <FileText className="w-5 h-5" />,
    path: DOCTOR_ROUTES.LAB_RESULTS, // e.g. '/doctor/lab-results'
  },
  {
    label: 'Wallet',
    icon: <Wallet className="w-5 h-5" />,
    path: DOCTOR_ROUTES.WALLET, // e.g. '/doctor/wallet'
  },
];

const DoctorSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
   const handleLogout = async () => {
    try {
      await authApi.logout();
      localStorage.removeItem('role');
      toast.success('logout success');
      window.location.href = '/login/doctor';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };


  return (
    <aside
      className={`
        relative flex flex-col bg-white border-r border-gray-200 shadow-sm
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        min-h-screen
      `}
    >
      {/* Logo area */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-800">MedSync</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
                transition-colors duration-150 group
                ${isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="
          absolute -right-3 top-20
          w-6 h-6 rounded-full bg-white border border-gray-200 shadow
          flex items-center justify-center
          hover:bg-gray-50 transition-colors z-10
        "
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-gray-500" />
          : <ChevronLeft className="w-3 h-3 text-gray-500" />
        }
      </button>
 <button
  onClick={handleLogout}
  className="p-2 bg-red-500 text-white  hover:bg-red-600 transition-colors"
  title="Logout"
>
  LOGOUT
</button>
    </aside>
  );
};

export default DoctorSidebar;