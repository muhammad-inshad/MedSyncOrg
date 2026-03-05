import express from "express";
import { upload } from "../middleware/multer.middleware.ts";
import { hospitalContainer } from "../di/hospital.di.ts";

const router = express.Router();
const { doctorManagement, patientManagement, hospitalController } = hospitalContainer();


router.get("/getme", hospitalController.getHospitalProfile.bind(hospitalController));
router.patch("/reapply", hospitalController.reapply.bind(hospitalController));
router.patch("/hospitals/:id",upload.fields([{ name: "logo", maxCount: 1 },
    { name: "licence", maxCount: 1 },
    { name: "landscape", maxCount: 3 },
    { name: "medicalTeam", maxCount: 3 },
    { name: "patientCare", maxCount: 3 },
    { name: "services", maxCount: 3 },]),hospitalController.updateHospital.bind(hospitalController));

router.get("/getalldoctors", doctorManagement.getAllDoctors.bind(doctorManagement));
router.patch("/doctorEdit/:id", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 }
]), doctorManagement.updateDoctor.bind(doctorManagement));
router.get("/getkycdoctors", doctorManagement.getAllKycDoctors.bind(doctorManagement));
router.patch("/doctorsToggle/:id", doctorManagement.doctorsToggle.bind(doctorManagement));
router.patch("/doctorAccept/:id", doctorManagement.acceptDoctor.bind(doctorManagement));
router.patch("/doctorReject/:id", doctorManagement.rejectDoctor.bind(doctorManagement));
router.patch("/doctorRevision/:id", doctorManagement.requestRevisionDoctor.bind(doctorManagement));

router.post("/register-doctor", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 }
]), doctorManagement.registerDoctor.bind(doctorManagement));

router.patch("/PatientsToggle/:id", patientManagement.patientsToggle.bind(patientManagement));
router.get("/getallpatients", patientManagement.getAllPatient.bind(patientManagement));
router.post("/patientAdd", upload.single('image'), patientManagement.addPatient.bind(patientManagement));
router.patch("/patientEdit/:id", upload.single('image'), patientManagement.updatePatient.bind(patientManagement));

export default router;
