import SuperAdminSidebar from '@/modules/superAdmin/components/SuperAdminsidebar';
import { type ReactNode } from 'react';

interface ManagementLayoutProps {
  title: string;
  subtitle: string;
  action?: {
    label: string;
    icon: ReactNode;
    onClick: () => void;
  };
  children: ReactNode;
}

const ManagementLayout = ({ title, subtitle, action, children }: ManagementLayoutProps) => (
  <div className="flex min-h-screen bg-gray-50">
    <SuperAdminSidebar />

    <div className="flex-1">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">{subtitle}</p>
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {action.icon}
              {action.label}
            </button>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="px-8 py-6">
        {children}
      </div>
    </div>
  </div>
);

export default ManagementLayout;