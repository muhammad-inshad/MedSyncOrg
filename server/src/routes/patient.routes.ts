import { Router } from "express";
import { patientContainer } from "../di/patient.di.ts";

const { patientController,liveToken} = patientContainer();
const router = Router();

router.get("/me", patientController.getMe.bind(patientController));

router.get("/hospitals", patientController.getHospitals.bind(patientController));
router.get("/patients", patientController.getAllPatient.bind(patientController))
router.patch("/patients", patientController.updatePatient.bind(patientController));
router.patch("/patients/password", patientController.changePassword.bind(patientController));
router.get("/hospitals/:id", patientController.selectedHospital.bind(patientController));
router.get("/departments", patientController.getdepartments.bind(patientController))
router.get("/departments/:id/doctors", patientController.getDoctorDepartment.bind(patientController))
router.get("/doctors/:id", patientController.getDoctorById.bind(patientController));
router.get("/doctors/:doctorId/slots", patientController.getAvailableSlots.bind(patientController));
router.post("/appointments/check-duplicate", patientController.checkDuplicateAppointment.bind(patientController));
router.post("/appointments", patientController.bookAppointment.bind(patientController));
router.get("/patients/appointments",patientController.getAppoimentHistory.bind(patientController))
router.get("/appointments/today", patientController.getTodayAppointments.bind(patientController));
router.patch("/appointments/:id/cancel",patientController.appoinmentCancel.bind(patientController))
router.get("/appointments/status/:sessionId", patientController.checkAppointmentStatus.bind(patientController));
router.get("/livetoken", liveToken.getToken.bind(liveToken));
router.get("/prescriptions", patientController.getPrescriptions.bind(patientController));   
router.get("/doctors/:doctorId/fee", patientController.getDoctorFee.bind(patientController));
export default router;
