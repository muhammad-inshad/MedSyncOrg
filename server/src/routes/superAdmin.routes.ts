import express from "express";
import { superAdminContainer } from "../di/superAdmin.di.ts";
import { upload } from "../middleware/multer.middleware.ts";
import { validate } from '../middleware/validate.middleware.ts';
import { subscriptionSchema, hospitalEditSchema, patientEditSchema } from '../validators/superAdmin.validator.ts';
import { hospitalSignupSchema } from '../validators/auth.validator.ts';
import { addPatientSchema } from '../validators/hospital.validator.ts';

const router = express.Router();
const { dashboardController, hospitalController, kycController, patientManagementController, subscriptionController } = superAdminContainer();

// Dashboard
router.get("/dashboard/stats", dashboardController.getDashboardStats.bind(dashboardController));
router.get("/me", dashboardController.getme.bind(dashboardController));

// Hospital Management (Approved & Main)
router.get("/hospitals", hospitalController.hospitalManagement.bind(hospitalController));
router.patch("/hospitals/active", hospitalController.setActive.bind(hospitalController));
router.post("/hospitals", upload.fields([{ name: "logo", maxCount: 1 }, { name: "licence", maxCount: 1 }]), validate(hospitalSignupSchema), hospitalController.addHospital.bind(hospitalController));

router.patch("/hospitals/:id", upload.fields([{ name: "logo", maxCount: 1 }, { name: "licence", maxCount: 1 }]), validate(hospitalEditSchema), hospitalController.editHospital.bind(hospitalController));
router.patch("/hospitals/:id/status/:status", hospitalController.hospitalStatus.bind(hospitalController));
// KYC Management (Review)
router.get("/kyc", kycController.hospitals.bind(kycController));

// Patient Management
router.get("/patients", patientManagementController.getPatients.bind(patientManagementController));
router.patch("/patients/active", patientManagementController.togglePatientActive.bind(patientManagementController));
router.post("/patients", upload.single('image'), validate(addPatientSchema), patientManagementController.addPatient.bind(patientManagementController));
router.patch("/patients/:id", upload.single('image'), validate(patientEditSchema), patientManagementController.updatePatient.bind(patientManagementController));

// Subscription Management
router.get("/subscription", subscriptionController.getSubscriptions.bind(subscriptionController));
router.get("/subscribeHospital",subscriptionController.subscribeHospital.bind(subscriptionController))
router.post("/subscription", validate(subscriptionSchema), subscriptionController.addSubscription.bind(subscriptionController))
router.patch("/subscription/toggle", subscriptionController.toggleSubscription.bind(subscriptionController));
router.patch("/subscription/:id", validate(subscriptionSchema), subscriptionController.updateSubscription.bind(subscriptionController));

// Wallet Management
router.get("/wallet", dashboardController.getWallet.bind(dashboardController));
router.post("/wallet/withdraw", dashboardController.withdraw.bind(dashboardController));

export default router;
