import { Router } from "express";
import { doctorContainer } from "../di/doctor.di.ts";
import { upload } from "../middleware/multer.middleware.ts";
import { validate } from '../middleware/validate.middleware.ts';
import { doctorUpdateSchema, leaveSchema, prescriptionSchema } from '../validators/doctor.validator.ts';

const { doctorcontroller, appoimentController,consultation,slotcontroller,doctorDashboard} = doctorContainer()
const router = Router()


router.get("/me", doctorcontroller.getme.bind(doctorcontroller))
router.patch("/reapply/:id", doctorcontroller.reapplyDoctor.bind(doctorcontroller))
router.patch("/profile", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 }
]), validate(doctorUpdateSchema), doctorcontroller.updateDoctor.bind(doctorcontroller));
router.post("/leaves", upload.single("photo"), validate(leaveSchema), doctorcontroller.applyLeave.bind(doctorcontroller))
router.get("/leaves", doctorcontroller.getDoctorLeaves.bind(doctorcontroller))
router.get("/appointments/upcoming", appoimentController.getUpcomingAppointments.bind(appoimentController))

router.get("/consultation", consultation.getConsultation.bind(consultation))
router.patch("/consultation/:id/status", consultation.markAsCompleted.bind(consultation))
router.post("/prescription", validate(prescriptionSchema), consultation.prescription.bind(consultation))

router.post("/schedules", slotcontroller.createDoctorSchedule.bind(slotcontroller));
router.get("/schedules", slotcontroller.getDoctorSchedules.bind(slotcontroller));   
router.put("/schedules/:id", slotcontroller.updateDoctorSchedule.bind(slotcontroller));
router.patch("/schedules/:id", slotcontroller.deleteDoctorSchedule.bind(slotcontroller)); 

router.post("/salary-increase-request",doctorDashboard.SALARY_INCREASE_REQUEST .bind(doctorDashboard))
router.get("/salary-increase-request", doctorDashboard.GET_SALARY_INCREASE_REQUEST.bind(doctorDashboard))
router.get("/wallet", doctorDashboard.GET_WALLET.bind(doctorDashboard))
router.post("/withdraw/wallet", doctorDashboard.WITHDRAW.bind(doctorDashboard))
export default router