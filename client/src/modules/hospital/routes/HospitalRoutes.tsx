import { HOSPITAL_ROUTES } from '@/constants/frontend/hospital/hospital.routes'
import HospitalDashboard from '../pages/HospitalDashboard'
import HospitalSignup from '../../auth/pages/HospitalSignup'
import { Route, Routes } from 'react-router-dom'
import HospitalProtectedRoute from './HospitalProtectedRoutes'
import HospitalDoctorManagement from '../components/doctor/HospitalDoctorManagement'
import HospitalDoctorKycManagement from '../pages/HospitalDoctorKycManagement'
import HospitalDoctorEditPage from '../components/doctor/HospitalDoctorEditpage'
import HospitalAddDoctorpage from '../components/doctor/HospitalAddDoctorpage'
import PatientMangement from '../components/patient/PatientMangement'
import HospitalAddPatientPage from '../components/patient/HospitalAddPatientpage'
import HospitalPatientEdit from '../components/patient/HospitalPatientEdit'
import HospitalEdit from '../pages/HospitalEdit'
import HospitalLayout from "../components/HospitalLayout"
import DepartmentManagement from '../components/master/department/DepartmentManagement'
import QualificationManagement from '../components/master/qualification/QualificationManagement'
import SpecializationManagement from '../components/master/specialization/SpecializationManagement'


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
                    <Route path={HOSPITAL_ROUTES.HOSPITAL_DEPARTMENT_MANGEMENT} element={<DepartmentManagement/>}/>
                     <Route path={HOSPITAL_ROUTES.HOSPITAL_QULIFICATION_MANGEMENT} element={<QualificationManagement/>}/>
                      <Route path={HOSPITAL_ROUTES.HOSPITAL_SPECIALIZATION_MANGEMENT} element={<SpecializationManagement/>}/>
                </Route>
            </Route>
        </Routes>
    )
}

export default HospitalRoutes
