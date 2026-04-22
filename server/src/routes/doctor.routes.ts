import { Router } from "express";
import { doctorContainer } from "../di/doctor.di.ts";
import { upload } from "../middleware/multer.middleware.ts";

const { doctorcontroller, appoimentController,consultation,slotcontroller} = doctorContainer()
const router = Router()


router.get("/me", doctorcontroller.getme.bind(doctorcontroller))
router.patch("/reapply/:id", doctorcontroller.reapplyDoctor.bind(doctorcontroller))
router.patch("/profile", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 }
]), doctorcontroller.updateDoctor.bind(doctorcontroller));
router.post("/leaves", upload.single("photo"), doctorcontroller.applyLeave.bind(doctorcontroller))
router.get("/leaves", doctorcontroller.getDoctorLeaves.bind(doctorcontroller))
router.get("/appointments/upcoming", appoimentController.getUpcomingAppointments.bind(appoimentController))

router.get("/consultation", consultation.getConsultation.bind(consultation))
router.patch("/consultation/:id/status", consultation.markAsCompleted.bind(consultation))
router.post("/prescription",consultation.prescription.bind(consultation))

router.post("/schedules", slotcontroller.createDoctorSchedule.bind(slotcontroller));
router.get("/schedules", slotcontroller.getDoctorSchedules.bind(slotcontroller));     // add this
router.patch("/schedules/:id", slotcontroller.deleteDoctorSchedule.bind(slotcontroller)); // add this
export default router