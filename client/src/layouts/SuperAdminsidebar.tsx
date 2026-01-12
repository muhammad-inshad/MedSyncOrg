import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  Users,
  UserPlus,
  UsersRound,
  CreditCard,
  Shield,
  MessageSquare,
  LogOut,
  Hospital
} from 'lucide-react'
import { SUPERADMINROUTES } from '@/constants/routes/routes'

const SuperAdminSidebar = () => {
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: SUPERADMINROUTES.DASHBOARD },
    { icon: Building2, label: 'Hospital Management', path: SUPERADMINROUTES.HOSPITALS },
    { icon: UserPlus, label: 'Doctor Management', path: SUPERADMINROUTES.DOCTORS },
    { icon: Users, label: 'Patient Management', path: SUPERADMINROUTES.PATIENTS },
    { icon: UsersRound, label: 'Department Management', path: SUPERADMINROUTES.DEPARTMENTS },
    { icon: CreditCard, label: 'Subscriptions', path: SUPERADMINROUTES.SUBSCRIPTIONS },
    { icon: Shield, label: 'KYC Verification', path: SUPERADMINROUTES.KYC },
    { icon: MessageSquare, label: 'Chat', path: SUPERADMINROUTES.CHAT }
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
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log-out</span>
        </button>
      </div>
    </div>
  )
}

export default SuperAdminSidebar
