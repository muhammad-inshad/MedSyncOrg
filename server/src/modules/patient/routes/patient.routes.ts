import { Router } from "express";
import { patientContainer } from "../../../di/patient.di.ts";

const { patientController } = patientContainer();
const router = Router();

router.get("/getme", (req, res) =>
  patientController.getMe(req, res)
);

export default router;
