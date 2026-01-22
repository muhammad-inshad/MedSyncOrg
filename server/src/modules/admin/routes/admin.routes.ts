import express from "express";
import { upload } from "../../../middleware/multer.middleware.ts";
import { adminContainer } from "../../../di/admin.di.ts";

const router = express.Router();
const { adminController } = adminContainer();

router.get("/getme",(req,res)=>adminController.getme(req,res))

export default router;
