import { Router } from 'express';
import {userContainer} from '../di/auth.di.ts';


const {authController, otpController} = userContainer();
const router = Router();


router.post('/send-otp', (req, res) => otpController.sendOtp(req, res));
router.post('/verify-otp', (req, res) => otpController.verifyOtp(req, res));
router.post('/signup', (req, res) => authController.signup(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));

export default router;
