import { Schema, model, Document, Types } from "mongoose";

export enum SalaryRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface ISalaryRequest extends Document {
  doctorId: Types.ObjectId;
  hospitalId: Types.ObjectId;

  currentAmount: number;      
  requestedAmount: number;   
  
  reason: string;          
  rejectionReason?: string;   

  status: SalaryRequestStatus;
  approvedAmount?: number;
  approvalNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

const salaryRequestSchema = new Schema<ISalaryRequest>(
  {
  
    doctorId: {
  type: Schema.Types.ObjectId,
  ref: "Doctor",
},

    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

   

    currentAmount: {
      type: Number,
      required: true,
    },

    requestedAmount: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(SalaryRequestStatus),
      default: SalaryRequestStatus.PENDING,
    },

    approvedAmount: {
      type: Number,
    },

    approvalNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SalaryRequestModel = model<ISalaryRequest>(
  "SalaryRequest",
  salaryRequestSchema
);