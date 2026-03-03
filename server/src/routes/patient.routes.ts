import { Router } from "express";
import { patientContainer } from "../di/patient.di.ts";

const { patientController } = patientContainer();
const router = Router();

router.get("/getme", patientController.getMe.bind(patientController));

router.get("/hospitals", patientController.getHospitals.bind(patientController));
router.get("/getAllPatient", patientController.getAllPatient.bind(patientController))
router.patch("/patientEdit/:id", patientController.updatePatient.bind(patientController));
router.patch("/changePassword/:id", patientController.changePassword.bind(patientController));


export default router;
