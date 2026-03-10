import express from "express";
import { superAdminContainer } from "../di/superAdmin.di.ts";
import { upload } from "../middleware/multer.middleware.ts";

const router = express.Router();
const { dashboardController, hospitalController, kycController, patientManagementController } = superAdminContainer();

// Dashboard
router.get("/dashboard-stats", dashboardController.getDashboardStats.bind(dashboardController));
router.get("/getme", dashboardController.getme.bind(dashboardController));

// Hospital Management (Approved & Main)
router.get("/hospitalManagement", hospitalController.hospitalManagement.bind(hospitalController));
router.patch("/setActive", hospitalController.setActive.bind(hospitalController));
router.post("/add-hospital", upload.fields([{ name: "logo", maxCount: 1 }, { name: "licence", maxCount: 1 }]), hospitalController.addHospital.bind(hospitalController));

router.patch("/hospitals/:id", upload.fields([{ name: "logo", maxCount: 1 }, { name: "licence", maxCount: 1 }]), hospitalController.editHospital.bind(hospitalController));
router.patch("/hospitalStatus/:id/:status", hospitalController.hospitalStatus.bind(hospitalController));
// KYC Management (Review)
router.get("/kyc-management", kycController.hospitals.bind(kycController));

// Patient Management
router.get("/getPatientManagement", patientManagementController.getPatients.bind(patientManagementController));
router.patch("/setPatientActive", patientManagementController.togglePatientActive.bind(patientManagementController));
router.post("/patientAdd", upload.single('image'), patientManagementController.addPatient.bind(patientManagementController));
router.patch("/patientEdit/:id", upload.single('image'), patientManagementController.updatePatient.bind(patientManagementController));

export default router;
