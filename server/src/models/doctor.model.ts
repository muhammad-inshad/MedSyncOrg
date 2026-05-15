import { Schema, model, Document, Types } from "mongoose";
import { Role } from "../constants/enums.js";



export interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: Role;
  specialization?: string;
  qualification: string;
  experience: string;
  department: string;
  hospital_id: Types.ObjectId;
  about: string;
  department_id?: string;
  specialization_id?: string;
  licence: string;
  profileImage: string;

  salary: number;

  rating: number;
  reviewCount: number;

  isActive: boolean;
  isAccountVerified: boolean;

  reviewStatus: "pending" | "approved" | "revision" | "rejected";
  reapplyDate?: Date;
  rejectionReason?: string;

  availableSlots: string[];

  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },

    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },

    address: {
      type: String,
      required: [true, 'Address is required'],
    },

    specialization_id: {
      type: String,
      required: [true, 'Specialization is required'],
    },

    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
    },

    experience: {
      type: String,
      required: [true, 'Experience is required'],
    },

    department_id: {
      type: String,
      required: [true, 'Department is required'],
    },

    hospital_id: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: false,
    },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.DOCTOR,
    },

    licence: {
      type: String,
      required: [true, 'Medical license is required'],
    },

    profileImage: {
      type: String,
      required: [true, 'Profile image is required'],
    },

    about: {
      type: String,
      required: [true, 'About is required'],
    },

    salary: {
      type: Number,
      default: 0,
      required: false
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    isAccountVerified: {
      type: Boolean,
      default: false,
    },

    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "revision", "rejected"],
      default: "pending",
    },

    reapplyDate: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

  },
  {
    timestamps: true,
  }
);

export const DoctorModel = model<IDoctor>("Doctor", doctorSchema);
