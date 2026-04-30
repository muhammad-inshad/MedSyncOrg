// models/HospitalDoctorConfig.model.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IHospitalDoctorConfig extends Document {
  hospitalId: Types.ObjectId;
  doctorId: Types.ObjectId;
  doctorFee: number;
  hospitalCommission: number;
  createdAt: Date;
  updatedAt: Date;
}

const hospitalDoctorConfigSchema = new Schema<IHospitalDoctorConfig>(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    doctorFee: {
      type: Number,
      required: true,
      min: [0, "Doctor fee cannot be negative"],
      default: 0,
    },

    hospitalCommission: {
      type: Number,
      required: true,
      min: [0, "Commission cannot be negative"],
      default: 0,
    },
  },
  { timestamps: true }
);

export const HospitalDoctorConfigModel = model<IHospitalDoctorConfig>(
  "HospitalDoctorConfig",
  hospitalDoctorConfigSchema
);