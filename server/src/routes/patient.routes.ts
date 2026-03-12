import { Router } from "express";
import { patientContainer } from "../di/patient.di.ts";

const { patientController } = patientContainer();
const router = Router();

router.get("/me", patientController.getMe.bind(patientController));

router.get("/hospitals", patientController.getHospitals.bind(patientController));
router.get("/patients", patientController.getAllPatient.bind(patientController))
router.patch("/patients/:id", patientController.updatePatient.bind(patientController));
router.patch("/patients/:id/password", patientController.changePassword.bind(patientController));
router.get("/hospitals/:id", patientController.selectedHospital.bind(patientController));
router.get("/departments", patientController.getdepartments.bind(patientController))
router.get("/departments/:id/doctors", patientController.getDoctorDepartment.bind(patientController))
router.get("/doctors/:id", patientController.getDoctorById.bind(patientController));
router.get("/doctors/:doctorId/slots", patientController.getAvailableSlots.bind(patientController));
router.post("/appointments", patientController.bookAppointment.bind(patientController));
router.get("/patients/:patientID/appointments",patientController.getAppoimentHistory.bind(patientController))
router.patch("/appointments/:id/cancel",patientController.appoinmentCancel.bind(patientController))

export default router;
