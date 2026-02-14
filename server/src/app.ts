import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import otpRoutes from './routes/otp.routes.ts';
import patientRoutes from './routes/patient.routes.ts';
import doctorRoutes from './routes/doctor.routes.ts';
import adminRoutes from './routes/admin.routes.ts';
import superAdminRoutes from './routes/superAdmin.routes.ts';
import "./config/google.strategy.ts";
import { protect } from './middleware/auth.middleware.ts';

dotenv.config();
const app = express();
app.use(passport.initialize());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/api/auth", otpRoutes);
app.use("/api/patient", protect, patientRoutes);
app.use("/api/doctor", protect, doctorRoutes);
app.use("/api/admin", protect, adminRoutes);
app.use("/api/superadmin", protect, superAdminRoutes);

export default app;