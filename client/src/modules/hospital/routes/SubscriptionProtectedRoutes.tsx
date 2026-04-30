// SubscriptionProtectedRoutes.tsx
import { hospitalApi } from '@/constants/backend/hospital/hospital.api';
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { HOSPITAL_ROUTES } from '@/constants/frontend/hospital/hospital.routes';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useAppDispatch } from '@/hooks/redux';
import { loadHospitalData } from '@/store/selectedHospital/authThunk';
import SubscriptionExpiredModal from '../components/SubscriptionExpiredModal';

const  SubscriptionProtectedRoutes = () => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const { hospital } = useSelector((state: RootState) => state.hospital);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        if (!hospital && user?._id) {
          await dispatch(loadHospitalData({ hospitalId: user._id }));
        }
        const res = await hospitalApi.getSubscriptonForProtection();
        if (!cancelled) setIsAllowed(res.data?.data === true);
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
      return new Date(hospital.subscription.endDate) < new Date();
    }
    return false;
  }, [hospital]);

  const isSubscriptionPage = location.pathname.toLowerCase().includes('/hospital/subscription');
  const showModal = isExpired && !isSubscriptionPage;

  if (showModal) return <SubscriptionExpiredModal />; 
  if (isAllowed === null) return <div>Loading...</div>;
  if (!isAllowed) return <Navigate to={HOSPITAL_ROUTES.HOSPITAL_SUBSCRIPTION} replace />;

  return <Outlet />;  
};

export default SubscriptionProtectedRoutes