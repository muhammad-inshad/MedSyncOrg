import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  
  planName: string; 
  duration: number; 
  durationUnit: "months" | "years";
  description:string;
  amount: number;

  startDate: Date;
  endDate: Date;

  status: "active" | "expired" | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
  

    planName: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    durationUnit: {
      type: String,
      enum: ["months", "years"],
      default: "months",
    },


    description:{
      type:String,
      required:true
    },

    amount: {
      type: Number,
      required: true,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },

  },
  {
    timestamps: true,
  }
);

export const SubscriptionModel = mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);