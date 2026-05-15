import { Router } from 'express';
import { userContainer } from '../di/auth.di.js';
import { doctorContainer } from '../di/doctor.di.js';
import { hospitalContainer } from "../di/hospital.di.js";
import { upload } from "../middleware/multer.middleware.js";
import { superAdminContainer } from "../di/superAdmin.di.js";
import passport from 'passport';


const { superAdminAuthController } = superAdminContainer();
const { doctorAuthController } = doctorContainer()
const { authController, otpController } = userContainer();
const { hospitalAuthController } = hospitalContainer();
const { googleAuthController } = userContainer();
const router = Router();

router.post('/send-otp', otpController.sendOtp.bind(otpController));
router.post("/RegistorDoctor", upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "license", maxCount: 1 }
]), doctorAuthController.registerDoctor.bind(doctorAuthController));
router.post("/superadmin/login", superAdminAuthController.login.bind(superAdminAuthController));
router.post('/hospital/login', hospitalAuthController.loginHospital.bind(hospitalAuthController))
router.post("/hospital/signup", upload.fields([{ name: "logo", maxCount: 1 }, { name: "licence", maxCount: 1 },]), hospitalAuthController.signup.bind(hospitalAuthController));
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
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed` 
  }),
  googleAuthController.handleCallback.bind(googleAuthController)
);

router.get("/selectHospitals", doctorAuthController.selectHospitals.bind(doctorAuthController))
router.get("/hospitals/:hospitalId/departments", doctorAuthController.getHospitalDepartments.bind(doctorAuthController));
router.get("/hospitals/:hospitalId/qualifications", doctorAuthController.getHospitalQualifications.bind(doctorAuthController));
router.get("/hospitals/:hospitalId/specializations", doctorAuthController.getHospitalSpecializations.bind(doctorAuthController));

export default router;
