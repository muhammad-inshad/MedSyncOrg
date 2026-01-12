import express from "express";
import { upload } from "../middleware/multer.middleware.ts";
import { adminContainer } from "../di/admin.di.ts";

const router = express.Router();
const { adminController } = adminContainer();

router.post(
  "/signup",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "licence", maxCount: 1 },
  ]),
  (req, res) => adminController.signup(req, res)
);

router.post('/login',(req,res)=>adminController.login(req,res))
export default router;
