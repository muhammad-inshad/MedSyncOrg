import { Schema, model, Document, Types } from "mongoose";
import { string } from "zod";

export interface IDoctorLeave extends Document {
  doctorId: Types.ObjectId;
  startDate: Date;
  endDate: Date;

  leaveSession?: "morning" | "afternoon" | "evening" | "night";

  reason?: string;
  photo?: string;
  rejectedReson?:string

  status: "approved" | "pending" | "rejected";
}

const doctorLeaveSchema = new Schema<IDoctorLeave>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    leaveSession: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night"],
    },

    reason: {
      type: String,
    },
     rejectedReson:{
       type: String,
     },
    photo: {
      type: String,
    },

    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default model<IDoctorLeave>("DoctorLeave", doctorLeaveSchema);