import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDepartment extends Document {
  hospital_id: Types.ObjectId;
  departmentName: string;
  description?: string;

  doctors: Types.ObjectId[]; 

  isActive: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    hospital_id: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    departmentName: {
      type: String,
      required: true,
      trim: true,
    },


    image: {
      type: String,
    },
    description: {
      type: String,
    },

    doctors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDepartment>("Department", DepartmentSchema);