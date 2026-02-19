import express from "express";
import { superAdminContainer } from "../di/superAdmin.di.ts";

const router = express.Router();
const { controller, kyccontroller } = superAdminContainer();


router.get("/dashboard-stats", controller.getDashboardStats.bind(controller));
router.get("/hospitalManagement", controller.hospitalManagement.bind(controller))
router.get("/getme", controller.getme.bind(controller))
router.patch("/setActive", controller.setActive.bind(controller))
router.get("/hospitals", kyccontroller.hospitals.bind(kyccontroller))
router.patch("/hospitalStatus/:id/:status", kyccontroller.hospitalStatus.bind(kyccontroller))
router.patch("/reapply/:id", kyccontroller.reapply.bind(kyccontroller))
export default router;
