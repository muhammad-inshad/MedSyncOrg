import express from "express";
import { superAdminContainer } from "../../../di/superAdmin.di.ts";

const router = express.Router();
const { controller } = superAdminContainer();


router.get("/hospitalManagement",(req,res)=>controller.hospitalManagement(req,res))
router.get("/getme",(req,res)=>controller.getme(req,res))
router.patch("/setActive",(req,res)=>controller.setActive(req,res))
export default router;
