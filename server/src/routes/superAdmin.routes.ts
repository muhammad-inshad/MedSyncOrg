import express from "express";
import { superAdminContainer } from "../di/superAdmin.di.ts";

const router = express.Router();
const { controller } = superAdminContainer();

router.post("/login", (req, res) => controller.login(req, res));
router.get("/hospitalManagement",(req,res)=>controller.hospitalManagement(req,res))

export default router;
