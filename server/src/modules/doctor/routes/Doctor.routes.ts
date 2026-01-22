import { Router } from "express";
import { doctorContainer } from "../../../di/doctor.di.ts";
import { upload } from "../../../middleware/multer.middleware.ts";

const { doctorcontroller } = doctorContainer()
const router = Router()
router.post("/RegistorDoctor", upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "license", maxCount: 1 },]),
    (req, res) => doctorcontroller.RegistorDoctor(req, res));

router.get("/getme",(req,res)=>doctorcontroller.getme(req,res))
export default router