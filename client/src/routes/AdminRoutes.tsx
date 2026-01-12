import { ADMINROUTES } from '../constants/routes/routes'
import AdminSignup from '@/modules/admin/AdminSignup.tsx'
import { Route, Routes } from 'react-router-dom'

const AdminRoutes = () => {
  return (
    <Routes>
        <Route path={ADMINROUTES.ADMINSIGNUP} element={<AdminSignup/>}/>
    </Routes>
  )
}

export default AdminRoutes