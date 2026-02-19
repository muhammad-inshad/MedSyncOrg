import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import authRoutes from './routes/auth.routes.ts';
import patientRoutes from './routes/patient.routes.ts';
import doctorRoutes from './routes/doctor.routes.ts';
import adminRoutes from './routes/admin.routes.ts';
import superAdminRoutes from './routes/superAdmin.routes.ts';
import "./config/google.strategy.ts";
import {adminAuthMiddleware} from "./middleware/admin.auth.middleware.ts";
import {doctorAuthMiddleware} from "./middleware/doctor.auth.middleware.ts";
import {patientAuthMiddleware} from "./middleware/patient.auth.middleware.ts";
import {superAdminAuthMiddleware} from "./middleware/superAdmin.auth.middleware.ts";

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

app.use("/api/auth", authRoutes);
app.use("/api/patient", patientAuthMiddleware, patientRoutes);
app.use("/api/doctor", doctorAuthMiddleware, doctorRoutes);
app.use("/api/admin", adminAuthMiddleware, adminRoutes);
app.use("/api/superadmin", superAdminAuthMiddleware, superAdminRoutes);

export default app;