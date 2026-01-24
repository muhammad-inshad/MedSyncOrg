import express from "express";
import { upload } from "../../../middleware/multer.middleware.ts";
import { adminContainer } from "../../../di/admin.di.ts";

const router = express.Router();
const { adminController,adminManagementController } = adminContainer();

router.get("/getme",(req,res)=>adminController.getme(req,res))
router.put("/hospitals/:id",(req,res)=>adminManagementController.editHospital(req,res))
router.get("/getalldoctors",(req,res)=>adminManagementController.getalldoctors(req,res))
router.patch("/doctorsToggle/:id",(req,res)=>adminManagementController.doctorsToggle(req,res))

export default router;
