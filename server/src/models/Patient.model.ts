import mongoose, { Schema, Document } from "mongoose";

export interface IPatient extends Document {
  name: string;
  email: string;
  phone: number;
  password: string;
  isGoogleAuth: boolean;

  fatherName?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date;
  address?: string;
  isActive: boolean;
  image?: string;
  bloodGroup?: string;

  walletBalance: number;
  medicalReports: string[];

  hospital_id?: mongoose.Types.ObjectId;
  appointmentHistory: mongoose.Types.ObjectId[];

  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: false },
    password: { type: String, required: false },
    isGoogleAuth: { type: Boolean, default: false },

    fatherName: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: { type: Date },
    address: { type: String },
    isActive: { type: Boolean },
    image: { type: String },
    bloodGroup: { type: String },

    walletBalance: { type: Number, default: 0 },

    medicalReports: { type: [String], default: [] },

    hospital_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },

    appointmentHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],

    isProfileComplete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Patient = mongoose.model<IPatient>("Patient", patientSchema);
