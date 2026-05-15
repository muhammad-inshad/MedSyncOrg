import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { hospitalContainer } from "../di/hospital.di.js";
import { departmentContiner } from "../di/department.di.js";
import { qualificationContainer } from "../di/qualification.di.js";
import { specializationContainer } from "../di/specialization.di.js";
const router = express.Router();
const { specializationManagement } = specializationContainer();
const { qualificationManagement } = qualificationContainer();
const { departmentManagement } = departmentContiner();
const { doctorManagement, patientManagement, hospitalController, hospitalSubscriptionController, dashbordController, doctorSalaryController } = hospitalContainer();
router.get("/me", hospitalController.getHospitalProfile.bind(hospitalController));
router.get("/hospitals/:id", hospitalController.getSelectedHospital.bind(hospitalController));
router.patch("/reapply", hospitalController.reapply.bind(hospitalController));
router.patch("/hospitals", upload.fields([{ name: "logo", maxCount: 1 },
    { name: "licence", maxCount: 1 },
    { name: "landscape", maxCount: 3 },
    { name: "medicalTeam", maxCount: 3 },
    { name: "patientCare", maxCount: 3 },
    { name: "services", maxCount: 3 },]), hospitalController.updateHospital.bind(hospitalController));
router.get("/doctors", doctorManagement.getAllDoctors.bind(doctorManagement));
router.patch("/doctors/:id", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 }
]), doctorManagement.updateDoctor.bind(doctorManagement));
router.get("/doctors/kyc", doctorManagement.getAllKycDoctors.bind(doctorManagement));
router.get("/doctors/leaves", doctorManagement.getLeaveDoctors.bind(doctorManagement));
router.get("/doctors/:id", doctorManagement.getDoctorDetails.bind(doctorManagement));
router.patch("/doctors/:id/toggle", doctorManagement.doctorsToggle.bind(doctorManagement));
router.patch("/doctors/:id/accept", doctorManagement.acceptDoctor.bind(doctorManagement));
router.patch("/doctors/:id/reject", doctorManagement.rejectDoctor.bind(doctorManagement));
router.patch("/doctors/:id/revision", doctorManagement.requestRevisionDoctor.bind(doctorManagement));
router.patch("/leaves/:id/status", doctorManagement.updateLeaveStatus.bind(doctorManagement));
router.get("/getdepsepquly", doctorManagement.getDeptSpecs.bind(doctorManagement));
router.post("/doctors", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 }
]), doctorManagement.registerDoctor.bind(doctorManagement));
router.patch("/patients/:id/toggle", patientManagement.patientsToggle.bind(patientManagement));
router.get("/patients", patientManagement.getAllPatient.bind(patientManagement));
router.post("/patients", upload.single('image'), patientManagement.addPatient.bind(patientManagement));
router.patch("/patients/:id", upload.single('image'), patientManagement.updatePatient.bind(patientManagement));
router.post("/departments", upload.single("image"), departmentManagement.createDepartment.bind(departmentManagement));
router.get("/departments", departmentManagement.getDepartments.bind(departmentManagement));
router.patch("/departments/:id/toggle", departmentManagement.toggleStatus.bind(departmentManagement));
router.patch("/departments/:id", upload.single("image"), departmentManagement.updateDepartment.bind(departmentManagement));
router.get("/qualifications", qualificationManagement.getQualifications.bind(qualificationManagement));
router.post("/qualifications", upload.single("image"), qualificationManagement.createQualification.bind(qualificationManagement));
router.patch("/qualifications/:id/toggle", qualificationManagement.toggleStatus.bind(qualificationManagement));
router.patch("/qualifications/:id", upload.single("image"), qualificationManagement.updateQualification.bind(qualificationManagement));
router.get("/specializations", specializationManagement.getSpecializations.bind(specializationManagement));
router.post("/specializations", upload.single("image"), specializationManagement.createSpecialization.bind(specializationManagement));
router.patch("/specializations/:id/toggle", specializationManagement.toggleStatus.bind(specializationManagement));
router.patch("/specializations/:id", upload.single("image"), specializationManagement.updateSpecialization.bind(specializationManagement));
router.get("/subscription", hospitalSubscriptionController.getActiveSubscriptions.bind(hospitalSubscriptionController));
router.get("/subscription/protection", hospitalSubscriptionController.protection.bind(hospitalSubscriptionController));
router.get("/dashboard-stats", dashbordController.getstatus.bind(dashbordController));
router.get("/getdoctorstatus", dashbordController.getDoctorStatus.bind(dashbordController));
router.get("/kyc-stats", dashbordController.getKycStats.bind(dashbordController));
router.get("/common-stats", dashbordController.getCommonStats.bind(dashbordController));
router.get("/doctors-salary-requests", doctorSalaryController.getDoctorSalaryRequests.bind(doctorSalaryController));
router.patch("/doctors-salary-requests/:id/status", doctorSalaryController.updateSalaryRequestStatus.bind(doctorSalaryController));
router.get("/wallet", dashbordController.getWallet.bind(dashbordController));
router.post("/wallet/withdraw", dashbordController.withdraw.bind(dashbordController));
router.get("/REQCansation", dashbordController.getReqcancalation.bind(dashbordController));
router.patch("/:id/REQCansation", dashbordController.approvecancellation.bind(dashbordController));
router.post("/:id/REQCansation", dashbordController.rejectcancellation.bind(dashbordController));
export default router;
