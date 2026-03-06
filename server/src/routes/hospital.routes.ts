import express from "express";
import { upload } from "../middleware/multer.middleware.ts";
import { hospitalContainer } from "../di/hospital.di.ts";
import { departmentContiner } from "../di/department.di.ts";
import { qualificationContainer } from "../di/qualification.di.ts";
import { specializationContainer } from "../di/specialization.di.ts";
const router = express.Router();
const { specializationManagement } = specializationContainer()
const { qualificationManagement } = qualificationContainer()
const { departmentManagement } = departmentContiner()
const { doctorManagement, patientManagement, hospitalController } = hospitalContainer();


router.get("/getme", hospitalController.getHospitalProfile.bind(hospitalController));
router.patch("/reapply", hospitalController.reapply.bind(hospitalController));
router.patch("/hospitals/:id", upload.fields([{ name: "logo", maxCount: 1 },
{ name: "licence", maxCount: 1 },
{ name: "landscape", maxCount: 3 },
{ name: "medicalTeam", maxCount: 3 },
{ name: "patientCare", maxCount: 3 },
{ name: "services", maxCount: 3 },]), hospitalController.updateHospital.bind(hospitalController));

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

router.post("/createDepartment", upload.single("image"), departmentManagement.createDepartment.bind(departmentManagement));
router.get("/department", departmentManagement.getDepartments.bind(departmentManagement));
router.patch("/departmentToggle/:id", departmentManagement.toggleStatus.bind(departmentManagement));
router.patch("/department/:id", upload.single("image"), departmentManagement.updateDepartment.bind(departmentManagement));

router.get("/qualification", qualificationManagement.getQualifications.bind(qualificationManagement));
router.post("/createQualification", upload.single("image"), qualificationManagement.createQualification.bind(qualificationManagement));
router.patch("/qualificationToggle/:id", qualificationManagement.toggleStatus.bind(qualificationManagement));
router.patch("/qualification/:id", upload.single("image"), qualificationManagement.updateQualification.bind(qualificationManagement));

router.get("/specialization", specializationManagement.getSpecializations.bind(specializationManagement));
router.post("/createSpecialization", upload.single("image"), specializationManagement.createSpecialization.bind(specializationManagement));
router.patch("/specializationToggle/:id", specializationManagement.toggleStatus.bind(specializationManagement));
router.patch("/specialization/:id", upload.single("image"), specializationManagement.updateSpecialization.bind(specializationManagement));

export default router;
