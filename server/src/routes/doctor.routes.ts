import { Router } from "express";
import { doctorContainer } from "../di/doctor.di.ts";
import { upload } from "../middleware/multer.middleware.ts";

const { doctorcontroller, doctorAuthController } = doctorContainer()
const router = Router()
router.post("/RegistorDoctor", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 },]),
    (req, res) => doctorAuthController.registerDoctor(req, res));

router.get("/getme", (req, res) => doctorcontroller.getme(req, res))
router.patch("/reapply/:id", (req, res) => doctorcontroller.reapplyDoctor(req, res))
router.patch("/doctorEdit/:id", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 }
]), (req, res) => doctorcontroller.doctorEdit(req, res));
export default router