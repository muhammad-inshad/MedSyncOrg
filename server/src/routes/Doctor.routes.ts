import { Router } from "express";
import { doctorContainer } from "../di/doctor.di.ts";
import { upload } from "../middleware/multer.middleware.ts";

const { doctorcontroller } = doctorContainer()
const router = Router()
router.post("/RegistorDoctor", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 },]),
    (req, res) => doctorcontroller.RegistorDoctor(req, res));

router.post("/login",(req,res)=>doctorcontroller.loginDoctor(req,res))
export default router