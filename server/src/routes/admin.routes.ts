import express from "express";
import { upload } from "../middleware/multer.middleware.ts";
import { adminContainer } from "../di/admin.di.ts";

const router = express.Router();
const { adminController, doctorManagement, patientManagement } = adminContainer();

router.get("/getme", (req, res) => adminController.getme(req, res))
router.put("/hospitals/:id", (req, res) => doctorManagement.editHospital(req, res))
router.get("/getalldoctors", (req, res) => doctorManagement.getAllDoctors(req, res))
router.patch("/doctorsToggle/:id", (req, res) => doctorManagement.doctorsToggle(req, res))
router.patch("/doctorAccept/:id", (req, res) => doctorManagement.acceptDoctor(req, res))
router.patch("/doctorReject/:id", (req, res) => doctorManagement.rejectDoctor(req, res))
router.patch("/doctorRevision/:id", (req, res) => doctorManagement.requestRevisionDoctor(req, res))
router.patch("/PatientsToggle/:id", (req, res) => patientManagement.patientToggle(req, res))
router.post("/patientAdd", upload.single('image'), (req, res) => patientManagement.patientAdd(req, res))
router.patch("/reapply/:id", (req, res) => doctorManagement.reapplyHospital(req, res))
router.get("/hospitals", (req, res) => adminController.getAllHospitals(req, res));

export default router;
