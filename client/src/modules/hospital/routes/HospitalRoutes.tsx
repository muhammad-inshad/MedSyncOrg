import { HOSPITAL_ROUTES } from '@/constants/frontend/hospital/hospital.routes'
import HospitalDashboard from '../pages/HospitalDashboard'
import HospitalSignup from '../../auth/pages/HospitalSignup'
import { Route, Routes } from 'react-router-dom'
import HospitalProtectedRoute from './HospitalProtectedRoutes'
import HospitalDoctorManagement from '../pages/HospitalDoctorManagement'
import HospitalDoctorKycManagement from '../pages/HospitalDoctorKycManagement'
import HospitalDoctorEditPage from '../components/doctor/HospitalDoctorEditpage'
import HospitalAddDoctorpage from '../components/doctor/HospitalAddDoctorpage'
import PatientMangement from '../pages/PatientMangement'
import HospitalAddPatientPage from '../components/patient/HospitalAddPatientpage'
import HospitalPatientEdit from '../components/patient/HospitalPatientEdit'
import HospitalEdit from '../pages/HospitalEdit'
import HospitalLayout from "../components/HospitalLayout"

const HospitalRoutes = () => {
    return (
        <Routes>
            <Route path={HOSPITAL_ROUTES.HOSPITALSIGNUP} element={<HospitalSignup />} />
            <Route element={<HospitalProtectedRoute />}>
                <Route element={<HospitalLayout />}>
                    <Route path={HOSPITAL_ROUTES.HOSPITALDASHBOARD} element={<HospitalDashboard />} />
                    <Route path={HOSPITAL_ROUTES.HOSPITALDOCTORMANGEMENT} element={<HospitalDoctorManagement />} />
                    <Route path={HOSPITAL_ROUTES.HOSPITALDOCTORKYC} element={<HospitalDoctorKycManagement />} />
                    <Route path={HOSPITAL_ROUTES.HOSPITALDOCTOREDIT} element={<HospitalDoctorEditPage />} />
                    <Route path={HOSPITAL_ROUTES.HOSPITALDOCTORADD} element={<HospitalAddDoctorpage />} />
                    <Route path={HOSPITAL_ROUTES.HOSPITALPATIENT} element={<PatientMangement />} />
                    <Route path={HOSPITAL_ROUTES.HOSPITALPATIENTADD} element={<HospitalAddPatientPage />} />
                    <Route path={HOSPITAL_ROUTES.HOSPITALPATIENTEDIT} element={<HospitalPatientEdit />} />
                    <Route path={HOSPITAL_ROUTES.HOSPITALEDIT} element={<HospitalEdit />} />
                </Route>
            </Route>
        </Routes>
    )
}

export default HospitalRoutes
