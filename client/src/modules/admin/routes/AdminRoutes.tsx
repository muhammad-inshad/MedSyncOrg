import { ADMIN_ROUTES } from '@/constants/frontend/admin/admin.routes'
import AdminDashboard from '../pages/AdminDashbord'
import AdminSignup from '../pages/AdminSignup'
import { Route, Routes } from 'react-router-dom'
import AdminProtectedRoute from './AdminProtectedRoutes'
import DoctorManagement from '../pages/DoctorMangement'
import DoctorKycManagement from '../pages/DoctorKycManagement'
import AdminDoctorEditPage from '../components/doctor/AdminDoctorEditpage'
import AdminAddDoctorpage from '../components/doctor/AdminAddDoctorpage'
import PatientMangement from '../pages/PatientMangement'
import AdminAddPatient from '../components/patient/PatientAddpage'
import PatientEdit from '../components/patient/patientEdit'
import AdminLayout from "../components/AdminLayout"



const AdminRoutes = () => {
  return (
    <Routes>
      <Route path={ADMIN_ROUTES.ADMINSIGNUP} element={<AdminSignup />} />
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>

          <Route path={ADMIN_ROUTES.ADMINDASHBOARD} element={<AdminDashboard />} />
          <Route path={ADMIN_ROUTES.ADMINDOCTORMANGEMENT} element={<DoctorManagement />} />
          <Route path={ADMIN_ROUTES.ADMINDOCTORKYC} element={<DoctorKycManagement />} />
          <Route path={ADMIN_ROUTES.ADMINDOCTOREDIT} element={<AdminDoctorEditPage />} />
          <Route path={ADMIN_ROUTES.ADMINDOCTORADD} element={<AdminAddDoctorpage />} />
          <Route path={ADMIN_ROUTES.ADMINPATIENT} element={<PatientMangement />} />
          <Route path={ADMIN_ROUTES.ADMINPATIENTADD} element={<AdminAddPatient />} />
          <Route path={ADMIN_ROUTES.ADMINPATIENTEDIT} element={<PatientEdit />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AdminRoutes