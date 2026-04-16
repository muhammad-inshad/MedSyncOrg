// SubscriptionProtectedRoutes.tsx
import { hospitalApi } from '@/constants/backend/hospital/hospital.api';
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { HOSPITAL_ROUTES } from '@/constants/frontend/hospital/hospital.routes';
import { Menu } from 'lucide-react';
import HospitalSidbar from '../components/HospitalSidbar';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useAppDispatch } from '@/hooks/redux';
import { loadHospitalData } from '@/store/selectedHospital/authThunk';
import SubscriptionExpiredModal from '../components/SubscriptionExpiredModal';

const SubscriptionProtectedRoutes = () => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { hospital } = useSelector((state: RootState) => state.hospital);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

 useEffect(() => {
  let cancelled = false;
  
  const init = async () => {
    try {
      // 1. Load hospital data (if needed)
      if (!hospital && user?._id) {
        await dispatch(loadHospitalData({ hospitalId: user._id }));
      }
      
      // 2. Check subscription
      const res = await hospitalApi.getSubscriptonForProtection();
      if (!cancelled) {
        setIsAllowed(res.data?.data === true);
      }
    } catch (error) {
      console.error(error);
      if (!cancelled) setIsAllowed(false);
    }
  };

  init();
  return () => { cancelled = true; };
}, [user?._id, dispatch, location.pathname, hospital]);
 
  const isExpired = React.useMemo(() => {
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

  if (isAllowed === null) {
    return <div>Loading...</div>;
  }

  if (!isAllowed) {
    return <Navigate to={HOSPITAL_ROUTES.HOSPITAL_SUBSCRIPTION} replace />;
  }
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <HospitalSidbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between bg-gray-900 px-4 py-3 text-white">
          <span className="font-bold">Hospital Admin</span>
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SubscriptionProtectedRoutes;