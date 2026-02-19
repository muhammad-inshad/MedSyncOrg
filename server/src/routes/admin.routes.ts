import express from "express";
import { upload } from "../middleware/multer.middleware.ts";
import { adminContainer } from "../di/admin.di.ts";

const router = express.Router();
const { adminController, doctorManagement, patientManagement } = adminContainer();

router.get("/getme", adminController.getme.bind(adminController))
router.patch("/hospitals/:id", doctorManagement.editHospital.bind(doctorManagement))
router.get("/getalldoctors", doctorManagement.getAllDoctors.bind(doctorManagement))
router.patch("/doctorsToggle/:id", doctorManagement.doctorsToggle.bind(doctorManagement))
router.patch("/doctorAccept/:id", doctorManagement.acceptDoctor.bind(doctorManagement))
router.patch("/doctorReject/:id", doctorManagement.rejectDoctor.bind(doctorManagement))
router.patch("/doctorRevision/:id", doctorManagement.requestRevisionDoctor.bind(doctorManagement))
router.patch("/PatientsToggle/:id", patientManagement.patientToggle.bind(patientManagement))
router.post("/patientAdd", upload.single('image'), patientManagement.patientAdd.bind(patientManagement))
router.patch("/reapply/:id", doctorManagement.reapplyHospital.bind(doctorManagement))
router.get("/hospitals", adminController.getAllHospitals.bind(adminController));
router.get("/dashboard-stats", adminController.getDashboardStats.bind(adminController));

export default router;
