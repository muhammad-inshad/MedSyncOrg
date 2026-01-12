import HospitalManagement from '@/modules/superAdmin/pages/HospitalManagement'
import { SUPERADMINROUTES } from '../constants/routes/routes'
import SuperAdminDashboard from '../modules/superAdmin/pages/SuperAdminDashbord'
import { Route, Routes } from 'react-router-dom'

const SuperAdminRoutes = () => {
  return (
    <Routes>
        <Route path={SUPERADMINROUTES.DASHBOARD} element={<SuperAdminDashboard/>}/>
        <Route path={SUPERADMINROUTES.HOSPITALS} element={<HospitalManagement/>}/>
    </Routes>
  )
}

export default SuperAdminRoutes