import HospitalManagement from '@/modules/superAdmin/pages/HospitalManagement'
import { SUPERADMIN_ROUTES } from '@/constants/frontend/superAdmin/superAdmin.routes'
import SuperAdminDashboard from '../pages/SuperAdminDashbord'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import EditHospital from '../components/EditHospital'
import SuperAdminAddHospital from '../components/SuperAdminAddHospital'
import KycManagement from '../pages/KycMangement'

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path={SUPERADMIN_ROUTES.DASHBOARD} element={<SuperAdminDashboard />} />
        <Route path={SUPERADMIN_ROUTES.HOSPITALS} element={<HospitalManagement />} />
        <Route path={SUPERADMIN_ROUTES.EDITHOSPITAL} element={<EditHospital />} />
        <Route path={SUPERADMIN_ROUTES.ADDHOSPITAL} element={<SuperAdminAddHospital />} />
        <Route path={SUPERADMIN_ROUTES.KYC} element={<KycManagement />} />
      </Route>
    </Routes>
  )
}

export default SuperAdminRoutes