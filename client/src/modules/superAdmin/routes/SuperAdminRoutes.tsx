import HospitalManagement from '@/modules/superAdmin/pages/HospitalManagement'
import { SUPERADMIN_ROUTES } from '@/constants/frontend/superAdmin/superAdmin.routes'
import SuperAdminDashboard from '../pages/SuperAdminDashboard'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import EditHospital from '../components/EditHospital'
import SuperAdminAddHospital from '../components/SuperAdminAddHospital'
import KycManagement from '../pages/KycManagement'
import PatientMangement from '../pages/PatientMangement'
import SuperAddpatient from '../components/patient/SuperAddpatient'
import SuperEditpatient from '../components/patient/SuperEditpatient'
import SubscriptionManagement from '../pages/SubscriptionManagement'
import EditSubscription from '../components/subscription/EditSubscription'

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path={SUPERADMIN_ROUTES.DASHBOARD} element={<SuperAdminDashboard />} />
        <Route path={SUPERADMIN_ROUTES.HOSPITALS} element={<HospitalManagement />} />
        <Route path={SUPERADMIN_ROUTES.EDITHOSPITAL} element={<EditHospital />} />
        <Route path={SUPERADMIN_ROUTES.ADDHOSPITAL} element={<SuperAdminAddHospital />} />
        <Route path={SUPERADMIN_ROUTES.KYC} element={<KycManagement />} />
        <Route path={SUPERADMIN_ROUTES.ADDPATIENT} element={<SuperAddpatient/>}/> 
        <Route path={SUPERADMIN_ROUTES.PATIENT}element={<PatientMangement/>}/>
        <Route path={SUPERADMIN_ROUTES.SUBSCRIPTIONS}element={<SubscriptionManagement/>}/>
        <Route path={SUPERADMIN_ROUTES.EDITPATIENT}element={<SuperEditpatient/>}/>
        <Route path={SUPERADMIN_ROUTES.EDITSUBSCRIPTION}element={<EditSubscription/>}/>
      </Route>
    </Routes>
  )
}

export default SuperAdminRoutes