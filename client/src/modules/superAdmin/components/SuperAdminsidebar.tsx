import { NavLink } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/redux';
import { logout } from '@/store/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  CreditCard,
  Shield,
  MessageSquare,
  LogOut,
  Hospital
} from 'lucide-react'
import { SUPERADMIN_ROUTES } from '@/constants/frontend/superAdmin/superAdmin.routes'
import api from '@/lib/api';
import toast from 'react-hot-toast';

const SuperAdminSidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout")
      dispatch(logout())
      localStorage.removeItem("role")
      toast.success("Logged out successfully!")
      navigate("/", { replace: true })
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logout());
      toast.error("Session cleared");
    }
  };
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: SUPERADMIN_ROUTES.DASHBOARD },
    { icon: Building2, label: 'Hospital Management', path: SUPERADMIN_ROUTES.HOSPITALS },
    { icon: CreditCard, label: 'Subscriptions', path: SUPERADMIN_ROUTES.SUBSCRIPTIONS },
    { icon: Shield, label: 'KYC Verification', path: SUPERADMIN_ROUTES.KYC },
    { icon: MessageSquare, label: 'Chat', path: SUPERADMIN_ROUTES.CHAT }
  ]

  return (
    <div className="w-64 bg-white shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-6 border-b flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <Hospital className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-gray-900">MedSync Admin</h1>
          <p className="text-xs text-gray-500">Healthcare Management</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors
              ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log-out</span>
        </button>
      </div>
    </div>
  )
}

export default SuperAdminSidebar
