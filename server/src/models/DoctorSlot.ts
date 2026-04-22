import { Schema, model, Types, Document } from "mongoose";

export interface IDoctorSchedule extends Document {
  doctorId: Types.ObjectId;

  daysOfWeek: number[];

  session: "morning" | "afternoon" | "evening";

  startTime: string;   
  endTime: string;    

  slotDuration: number; 

  validFrom?: Date;
  validUntil?: Date;     
    tokenPerDay: number;

  isActive: boolean;
}

const doctorScheduleSchema = new Schema<IDoctorSchedule>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    daysOfWeek: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.every(d => d >= 0 && d <= 6),
        message: "Days must be between 0 (Sunday) and 6 (Saturday)",
      },
    },

    tokenPerDay: {
  type: Number,
  required: true,
  min: 1,
},
    session: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      required: true,
    },

    startTime: { type: String, required: true },  
    endTime: { type: String, required: true },

    slotDuration: { type: Number, required: true, min: 5 },

    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DoctorScheduleModel = model<IDoctorSchedule>(
  "DoctorSchedule",
  doctorScheduleSchema
);