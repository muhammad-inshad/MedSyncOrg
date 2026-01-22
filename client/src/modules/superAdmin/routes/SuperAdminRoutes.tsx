import HospitalManagement from '@/modules/superAdmin/pages/HospitalManagement'
import { SUPERADMINROUTES } from '../../../constants/routes/routes'
import SuperAdminDashboard from '../pages/SuperAdminDashbord'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import EditHospital from '../components/EditHospital'

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path={SUPERADMINROUTES.DASHBOARD} element={<SuperAdminDashboard/>}/>
        <Route path={SUPERADMINROUTES.HOSPITALS} element={<HospitalManagement/>}/>
        <Route path={SUPERADMINROUTES.EDITHOSPITAL} element={<EditHospital/>}/>
        </Route>
    </Routes>
  )
}

export default SuperAdminRoutes