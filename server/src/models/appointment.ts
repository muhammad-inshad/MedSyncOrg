import mongoose, { Schema, Document, Types } from "mongoose";
import { IDoctor } from "./doctor.model.js";
import { IPatient } from "./Patient.model.js";

export enum AppointmentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  PROCESSING = "processing",
  REJECTED = "rejected",
}

export enum AppointmentMode {
  ONLINE = "online",
  OFFLINE = "offline",
}

export interface IMedicine {
  name: string;
  dosage: string;
  duration: string;
}

export interface IAppointment extends Document {
  bookedBy: Types.ObjectId | IPatient;
  doctorId: Types.ObjectId | IDoctor;
  hospitalId: Types.ObjectId;

  appointmentDate: Date;

  tokenNumber: number;

  visitTime: string;

  mode: AppointmentMode;

  status: AppointmentStatus;

  slotStartTime: string;
  slotEndTime: string;

  cancelRequest?:boolean;

  requsetRejectedReason?:string;

  patientDetails: {
    name: string;
    age: number;
    phone: string;
    email?: string;
    address?: string;
  };
  cancelReason?: string;
  rejectionReason?: string;
  bloodPressure?: string;
  heartRate?: string;
  weight?: string;
  session?: "morning" | "afternoon" | "evening";
  createdAt: Date;
  updatedAt: Date;
  paymentId?: string;
  totalAmount?: number;
  paymentstatus?: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    slotStartTime: { type: String, required: true },
    slotEndTime: { type: String, required: true },

    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    requsetRejectedReason: {
      type: String,
    },
    cancelRequest: {
      type: Boolean,
      default: false,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    paymentstatus: {
      type: String,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    visitTime: {
      type: String,
    },

    mode: {
      type: String,
      enum: Object.values(AppointmentMode),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },
    patientDetails: {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String },
    },

    rejectionReason: {
      type: String,
    },

    cancelReason: {
      type: String,
    },
    bloodPressure: {
      type: String,
    },
    heartRate: {
      type: String,
    },
    weight: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    session: {
      type: String,
      enum: ["morning", "afternoon", "evening"]
    }
  },
  {
    timestamps: true,
  },
);

export const AppointmentModel = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema,
);
