import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISpecialization extends Document {
  hospital_id: Types.ObjectId;
  department_id: Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SpecializationSchema = new Schema<ISpecialization>(
  {
    hospital_id: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    department_id: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
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

export default mongoose.model<ISpecialization>(
  "Specialization",
  SpecializationSchema
);