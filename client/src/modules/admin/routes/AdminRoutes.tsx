import { ADMINROUTES } from '../../../constants/routes/routes'
import AdminDashboard from '../pages/AdminDashbord'
import AdminSignup from '../pages/AdminSignup'
import { Route, Routes } from 'react-router-dom'
import AdminProtectedRoute from '@/modules/doctor/routes/AdminProtectedRoute'
import DoctorManagement from '../pages/DoctorMangement'
import AdminDoctorEditPage from '../components/AdminDoctorEditpage'
import AdminAddDoctorpage from '../components/AdminAddDoctorpage'

const AdminRoutes = () => {
  return (
    <Routes>
        <Route path={ADMINROUTES.ADMINSIGNUP} element={<AdminSignup/>}/>
      <Route element={<AdminProtectedRoute/>}>
        <Route path={ADMINROUTES.ADMINDASHBOARD} element={<AdminDashboard/>}/>
        <Route path={ADMINROUTES.ADMINDOCTORMANGEMENT} element={<DoctorManagement/>}/>
        <Route path={ADMINROUTES.ADMINDOCTOREDIT} element={<AdminDoctorEditPage/>}/>
        <Route path={ADMINROUTES.ADMINDOCTORADD} element={<AdminAddDoctorpage/>}/>
        </Route>
    </Routes>

  )
}

export default AdminRoutes