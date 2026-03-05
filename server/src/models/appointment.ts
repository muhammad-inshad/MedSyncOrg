import mongoose, { Schema, Document, Types } from "mongoose";

export enum AppointmentStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CANCELLED = "cancelled"
}

export enum AppointmentMode {
  ONLINE = "online",
  OFFLINE = "offline"
}

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  hospitalId: Types.ObjectId;

  appointmentDate: Date;

  tokenNumber: number;

  visitTime: string;

  mode: AppointmentMode;

  status: AppointmentStatus;

  rejectionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
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

    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const AppointmentModel = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);