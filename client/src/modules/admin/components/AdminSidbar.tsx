import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from '@/hooks/redux';
import { logout } from '@/store/auth/authSlice';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  LayoutDashboard,
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
  Stethoscope,
  UserPlus,
  X, // Import X to close sidebar
  type LucideIcon,
} from 'lucide-react';
import { ADMIN_ROUTES } from '@/constants/frontend/admin/admin.routes';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path?: string;
}

// Add props for mobile responsiveness
interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AdminSidbar = ({ isOpen, setIsOpen }: AdminSidebarProps) => {
  const [activeMenu, setActiveMenu] = React.useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: ADMIN_ROUTES.ADMINDASHBOARD },
    { icon: Stethoscope, label: 'Doctor Management', path: ADMIN_ROUTES.ADMINDOCTORMANGEMENT },
    { icon: UserCheck, label: 'Doctor KYC', path: ADMIN_ROUTES.ADMINDOCTORKYC },
    { icon: UserPlus, label: 'Patient Management', path: ADMIN_ROUTES.ADMINPATIENT },
    { icon: DollarSign, label: 'Finance' },
    { icon: Wallet, label: 'Payout Management' },
    { icon: RefreshCw, label: 'Return Payment' },
    { icon: Building2, label: 'Department' },
    { icon: BadgeDollarSign, label: 'Doctor Salary Inc' },
    { icon: UserCheck, label: 'Doctor Selection' },
    { icon: Umbrella, label: 'Doctor Leave Management' },
    { icon: User, label: 'Profile' },
    { icon: SquareStack, label: 'Chat' },
    { icon: Bell, label: 'Subscription' },
  ];

  const handleClick = (item: MenuItem) => {
    setActiveMenu(item.label);
    if (item.path) navigate(item.path);
    // Close sidebar automatically on mobile after clicking a link
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      dispatch(logout());
      localStorage.removeItem("role");
      toast.success("Logged out successfully!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logout());
      toast.error("Session cleared");
    }
  };

  return (
    <>
      {/* Mobile Overlay: darkens background when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col h-screen transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-0
      `}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Admin</h3>
              <p className="text-[10px] text-gray-400">Hospital Admin</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button className="md:hidden" onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-sm transition ${activeMenu === item.label
                ? 'bg-gray-800 border-l-4 border-blue-500 text-blue-400'
                : 'hover:bg-gray-800 text-gray-300'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition">
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidbar;