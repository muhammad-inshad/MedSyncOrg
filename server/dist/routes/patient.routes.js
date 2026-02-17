import { Router } from "express";
import { patientContainer } from "../di/patient.di.ts";
const { patientController } = patientContainer();
const router = Router();
router.get("/getme", (req, res) => patientController.getMe(req, res));
router.get("/getAllPatient", (req, res) => patientController.getAllPatient(req, res));
router.patch("/patientEdit/:id", (req, res) => patientController.patientEdit(req, res));
export default router;
