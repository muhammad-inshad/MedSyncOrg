import { Router } from 'express';
import { userContainer } from '../di/auth.di.ts';
import { doctorContainer } from '../di/doctor.di.ts';
import { adminContainer } from "../di/admin.di.ts";
import { upload } from "../middleware/multer.middleware.ts";
import { superAdminContainer } from "../di/superAdmin.di.ts";
import passport from 'passport';


const {superAdminAuthController } = superAdminContainer();
const {doctorAuthController } = doctorContainer()
const { authController, otpController } = userContainer();
const {  adminAuthController } = adminContainer();
const { googleAuthController } = userContainer();
const router = Router();

router.post('/send-otp', otpController.sendOtp.bind(otpController));
router.post("/Superadmin/login", superAdminAuthController.login.bind(superAdminAuthController));
router.post('/admin/login', adminAuthController.loginAdmin.bind(adminAuthController))
router.post("/admin/signup", upload.fields([{ name: "logo", maxCount: 1 }, { name: "licence", maxCount: 1 },]), adminAuthController.signup.bind(adminAuthController));
router.post('/verify-otp', otpController.verifyOtp.bind(otpController));
router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController))
router.post('/logout', authController.logout.bind(authController))
router.post("/doctor/login", doctorAuthController.loginDoctor.bind(doctorAuthController))
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
  googleAuthController.handleCallback.bind(googleAuthController) 
);

export default router;
