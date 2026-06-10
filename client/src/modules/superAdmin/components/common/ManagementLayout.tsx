import SuperAdminSidebar from '@/modules/superAdmin/components/SuperAdminsidebar';
import { type ReactNode, useState } from 'react';
import { Menu, X } from 'lucide-react';

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

const ManagementLayout = ({ title, subtitle, action, children }: ManagementLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden relative">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed on mobile, static on md+ */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <SuperAdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-0 min-w-0">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">{title}</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 hidden sm:block truncate">{subtitle}</p>
              </div>
            </div>
            {action && (
              <button
                onClick={action.onClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm md:text-base whitespace-nowrap shrink-0"
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-8 overflow-x-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ManagementLayout;