import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import "dotenv/config";
import passport from "passport";
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import superAdminRoutes from './routes/superAdmin.routes.js';
import { superAdminAuthMiddleware } from "./middleware/superAdmin.auth.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import { hospitalContainer } from "./di/hospital.di.js";
import { patientContainer } from "./di/patient.di.js";
import { doctorContainer } from "./di/doctor.di.js";
import paymentRoutes from "./routes/payment.routes.js";
import "./config/google.strategy.js";


const { patientAuthMiddleware } = patientContainer();
const { hospitalAuthMiddleware } = hospitalContainer();
const { doctorAuthMiddleware } = doctorContainer();


const app = express();
app.set('trust proxy', 1);

app.use((req, _res, next) => {
  next();
});

app.use(passport.initialize());

app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://med-sync-org-72v5.vercel.app'
    ];
    if (!origin || allowedOrigins.some(o => o && origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


app.use("/api/payment/webhook", express.raw({ type: 'application/json' }));
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/patient", patientAuthMiddleware.handle, patientRoutes);
app.use("/api/doctor", doctorAuthMiddleware.handle, doctorRoutes);
app.use("/api/hospital", hospitalAuthMiddleware.handle, hospitalRoutes);
app.use("/api/superadmin", superAdminAuthMiddleware, superAdminRoutes);

app.use(errorHandler);

export default app;