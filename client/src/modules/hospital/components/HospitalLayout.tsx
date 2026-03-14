import { useState, useMemo, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react'; // Hamburger icon
import HospitalSidbar from './HospitalSidbar';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import SubscriptionExpiredModal from './SubscriptionExpiredModal';
import { useAppDispatch } from '@/hooks/redux';
import { loadHospitalData } from '@/store/selectedHospital/authThunk';

const HospitalLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { hospital } = useSelector((state: RootState) => state.hospital);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    if (!hospital && user?._id) {
      dispatch(loadHospitalData({ hospitalId: user._id }));
    }
  }, [hospital, user, dispatch]);
console.log(hospital?.subscription,"inshad")
  const isExpired = useMemo(() => {
    if (!hospital?.subscription) return false;
    
    if (hospital.subscription.status === 'expired') return true;

    if (hospital.subscription.endDate) {
      const endDate = new Date(hospital.subscription.endDate);
      return endDate < new Date();
    }

    return false;
  }, [hospital]);

  const isSubscriptionPage = location.pathname.toLowerCase().includes('/hospital/subscription');
  const showModal = isExpired && !isSubscriptionPage;
  

  if (showModal) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <SubscriptionExpiredModal />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Component */}
      <HospitalSidbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

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

export default HospitalLayout;