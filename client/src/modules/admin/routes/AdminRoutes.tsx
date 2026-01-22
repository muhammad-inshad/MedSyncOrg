import { ADMINROUTES } from '../../../constants/routes/routes'
import AdminDashboard from '../pages/AdminDashbord'
import AdminSignup from '../pages/AdminSignup'
import { Route, Routes } from 'react-router-dom'
import AdminProtectedRoute from '@/modules/doctor/routes/AdminProtectedRoute'

const AdminRoutes = () => {
  return (
    <Routes>
        <Route path={ADMINROUTES.ADMINSIGNUP} element={<AdminSignup/>}/>
      <Route element={<AdminProtectedRoute/>}>
        <Route path={ADMINROUTES.ADMINDASHBOARD} element={<AdminDashboard/>}/>
        </Route>
    </Routes>

  )
}

export default AdminRoutes