import { Router } from 'express';
import { userContainer } from '../di/auth.di.ts';
import { doctorContainer } from '../di/doctor.di.ts';
import { adminContainer } from "../di/admin.di.ts";
import { upload } from "../middleware/multer.middleware.ts";
import { superAdminContainer } from "../di/superAdmin.di.ts";
import passport from 'passport';
import { GoogleAuthController } from "../controllers/googleAuth.controller.ts";

const { controller, superAdminAuthController } = superAdminContainer();
const { doctorcontroller, doctorAuthController } = doctorContainer()
const { authController, otpController } = userContainer();
const { adminController, adminAuthController } = adminContainer();
const { googleAuthController } = userContainer();
const router = Router();

router.post('/send-otp', (req, res) => otpController.sendOtp(req, res));
router.post("/Superadmin/login", (req, res) => superAdminAuthController.login(req, res));
router.post('/admin/login', (req, res) => adminAuthController.login(req, res))
router.post("/admin/signup", upload.fields([{ name: "logo", maxCount: 1 }, { name: "licence", maxCount: 1 },]), (req, res) => adminAuthController.signup(req, res));
router.post('/verify-otp', (req, res) => otpController.verifyOtp(req, res));
router.post('/signup', (req, res) => authController.signup(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res))
router.post('/logout', (req, res) => authController.logout(req, res))
router.post("/doctor/login", (req, res) => doctorAuthController.loginDoctor(req, res))
router.get('/google', (req, res, next) => {
  const { role } = req.query;
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role as string,
    prompt: 'select_account'
  })(req, res, next);
});
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => googleAuthController.handleCallback(req as any, res)
);

export default router;
