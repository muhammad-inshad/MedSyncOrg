import mongoose, { Schema, Document } from "mongoose";
import { Role } from "../constants/enums.js";

export interface ISuperAdmin extends Document {
  email: string;
  password: string;
   role: Role;   
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SuperAdminSchema = new Schema<ISuperAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false, 
    },
        role: {
  type: String,
  enum: Object.values(Role),
  default: Role.SUPER_ADMIN,
},

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SuperAdminModel = mongoose.model<ISuperAdmin>(
  "SuperAdmin",
  SuperAdminSchema
);
