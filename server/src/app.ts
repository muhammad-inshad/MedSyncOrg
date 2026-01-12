import express from "express";
import cors from 'cors';
import otpRoutes from './routes/otp.routes.ts'
import {protect}  from './middleware/auth.middleware.ts'
import cookieParser from "cookie-parser";
import patientRoutes from './routes/patient.routes.ts'
import doctorRoutes from './routes/Doctor.routes.ts'
import adminRoutes from './routes/admin.routes.ts'
import superAdminRoutes from './routes/superAdmin.routes.ts'
const app=express()
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", otpRoutes);
app.use("/patient", protect, patientRoutes);
app.use("/doctor",doctorRoutes)
app.use("/admin",adminRoutes)
app.use("/Superadmin", superAdminRoutes);

export default app