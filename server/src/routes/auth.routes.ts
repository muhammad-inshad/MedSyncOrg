import { Router } from 'express';
import { userContainer } from '../di/auth.di.ts';
import { doctorContainer } from '../di/doctor.di.ts';
import { hospitalContainer } from "../di/hospital.di.ts";
import { upload } from "../middleware/multer.middleware.ts";
import { superAdminContainer } from "../di/superAdmin.di.ts";
import passport from 'passport';
import { validate } from '../middleware/validate.middleware.ts';
import { 
  loginSchema, 
  patientSignupSchema, 
  doctorSignupSchema, 
  hospitalSignupSchema,
  resetPasswordSchema
} from '../validators/auth.validator.ts';


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
]), validate(doctorSignupSchema), doctorAuthController.registerDoctor.bind(doctorAuthController));
router.post("/superadmin/login", validate(loginSchema), superAdminAuthController.login.bind(superAdminAuthController));
router.post('/hospital/login', validate(loginSchema), hospitalAuthController.loginHospital.bind(hospitalAuthController))
router.post("/hospital/signup", upload.fields([{ name: "logo", maxCount: 1 }, { name: "licence", maxCount: 1 },]), validate(hospitalSignupSchema), hospitalAuthController.signup.bind(hospitalAuthController));
router.post('/verify-otp', otpController.verifyOtp.bind(otpController));
router.post('/signup', validate(patientSignupSchema), authController.signup.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword.bind(authController))
router.post('/logout', authController.logout.bind(authController))
router.post("/doctor/login", validate(loginSchema), doctorAuthController.loginDoctor.bind(doctorAuthController))
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
