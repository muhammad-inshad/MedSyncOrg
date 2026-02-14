import mongoose, { Schema, Document } from "mongoose";

export interface ISuperAdmin extends Document {
  email: string;
  password: string;
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
