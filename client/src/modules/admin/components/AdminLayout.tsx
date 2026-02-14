import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react'; // Hamburger icon
import AdminSidbar from './AdminSidbar';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Component */}
      <AdminSidbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar for Mobile */}
        <header className="md:hidden flex items-center justify-between bg-gray-900 px-4 py-3 text-white">
          <span className="font-bold">Hospital Admin</span>
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;