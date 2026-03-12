import { Router } from "express";
import { doctorContainer } from "../di/doctor.di.ts";
import { upload } from "../middleware/multer.middleware.ts";

const { doctorcontroller, appoimentController } = doctorContainer()
const router = Router()


router.get("/me", doctorcontroller.getme.bind(doctorcontroller))
router.patch("/reapply/:id", doctorcontroller.reapplyDoctor.bind(doctorcontroller))
router.patch("/profile/:id", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 }
]), doctorcontroller.updateDoctor.bind(doctorcontroller));
router.post("/leaves", upload.single("photo"), doctorcontroller.applyLeave.bind(doctorcontroller))
router.get("/leaves", doctorcontroller.getDoctorLeaves.bind(doctorcontroller))
router.get("/appointments/upcoming/:id", appoimentController.getUpcomingAppointments.bind(appoimentController))
export default router