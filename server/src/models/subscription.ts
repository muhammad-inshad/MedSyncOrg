import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubscription extends Document {
  hospitalId?: Types.ObjectId;

  plan: string;
  amount: number;

  status: "active" | "expired" | "cancelled";

  startDate?: Date;
  endDate?: Date;

  paymentId?: string;
  paymentMethod?: string;

  // Global Plan Specific Fields
  planName?: string;
  price?: number;
  duration?: number;
  durationUnit?: "days" | "months" | "years";
  features?: string[];
  isActive?: boolean;
  subscriberCount?: number;
  planType?: "Basic" | "Standard" | "Premium" | "Enterprise";
  description?: string;
  limits?: {
    maxPatients: number;
    maxDoctors: number;
    maxDepartments: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
    },

    plan: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
    },

    paymentId: {
      type: String,
      default: "",
    },

    paymentMethod: {
      type: String,
      default: "",
    },

    // Global Plan Specific Fields
    planName: {
      type: String,
    },
    price: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    durationUnit: {
      type: String,
      enum: ["days", "months", "years"],
      default: "months",
    },
    features: {
      type: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscriberCount: {
      type: Number,
      default: 0,
    },
    planType: {
      type: String,
      enum: ["Basic", "Standard", "Premium", "Enterprise"],
    },
    description: {
      type: String,
    },
    limits: {
      maxPatients: {
        type: Number,
        default: 0, 
      },
      maxDoctors: {
        type: Number,
        default: 0,
      },
      maxDepartments: {
        type: Number,
        default: 0,
      },
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