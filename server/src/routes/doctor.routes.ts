import { Router } from "express";
import { doctorContainer } from "../di/doctor.di.ts";
import { upload } from "../middleware/multer.middleware.ts";

const { doctorcontroller } = doctorContainer()
const router = Router()


router.get("/getme", doctorcontroller.getme.bind(doctorcontroller))
router.patch("/reapply/:id", doctorcontroller.reapplyDoctor.bind(doctorcontroller))
router.patch("/doctorEdit/:id", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 }
]), doctorcontroller.doctorEdit.bind(doctorcontroller));
export default router