import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import authRoutes from './routes/auth.routes.ts';
import patientRoutes from './routes/patient.routes.ts';
import doctorRoutes from './routes/doctor.routes.ts';
import hospitalRoutes from './routes/hospital.routes.ts';
import superAdminRoutes from './routes/superAdmin.routes.ts';
import "./config/google.strategy.ts";
import { superAdminAuthMiddleware } from "./middleware/superAdmin.auth.middleware.ts";
import errorHandler from "./middleware/error.middleware.ts";
import { hospitalContainer } from "./di/hospital.di.ts";
import { patientContainer } from "./di/patient.di.ts";
import { doctorContainer } from "./di/doctor.di.ts";

const { patientAuthMiddleware } = patientContainer();
const { hospitalAuthMiddleware } = hospitalContainer();
const { doctorAuthMiddleware } = doctorContainer();

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
app.use("/api/patient", patientAuthMiddleware.handle, patientRoutes);
app.use("/api/doctor", doctorAuthMiddleware.handle, doctorRoutes);
app.use("/api/hospital", hospitalAuthMiddleware.handle, hospitalRoutes);
app.use("/api/superadmin", superAdminAuthMiddleware, superAdminRoutes);

app.use(errorHandler);

export default app;