import mongoose, { Schema, Document, Types } from "mongoose";

export enum AppointmentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
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
  bookedBy: Types.ObjectId;
  doctorId: Types.ObjectId;
  hospitalId: Types.ObjectId;

  appointmentDate: Date;

  tokenNumber: number;

  visitTime: string;

  mode: AppointmentMode;

  status: AppointmentStatus;

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
  createdAt: Date;
  updatedAt: Date;
  paymentId?: string;
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

    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
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
  },
  {
    timestamps: true,
  },
);

export const AppointmentModel = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema,
);
