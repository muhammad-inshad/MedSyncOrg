import { Router } from "express";
import { patientContainer } from "../di/patient.di.ts";

const { patientController } = patientContainer();
const router = Router();

router.get("/getme", patientController.getMe.bind(patientController));

router.get("/hospitals", patientController.getHospitals.bind(patientController));
router.get("/getAllPatient", patientController.getAllPatient.bind(patientController))
router.patch("/patientEdit/:id", patientController.updatePatient.bind(patientController));
router.patch("/changePassword/:id", patientController.changePassword.bind(patientController));
router.get("/selected_hospital/:id", patientController.selectedHospital.bind(patientController));
router.get("/getdepartments", patientController.getdepartments.bind(patientController))
router.get("/get-department-doctors/:id", patientController.getDoctorDepartment.bind(patientController))
router.get("/doctor-details/:id", patientController.getDoctorById.bind(patientController));

export default router;
