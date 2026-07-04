import mongoose, { Schema, Document } from "mongoose";
import { Role } from "../constants/enums.ts";

export interface IHospital extends Document {
  hospitalName: string;
  logo?: string;
  address: string;
  password: string;
   role: Role;   
  isActive: boolean;
  autoDisabled: boolean;

  images: {
    landscape: string[];
    medicalTeam: string[];
    patientCare: string[];
    services: string[];
  };

  email: string;
  phone: string;

  since: number;
  pincode: string;

  about?: string;
  licence?: string;

  income: number;

  reviewStatus: "pending" | "approved" | "revision" | "rejected";
  reapplyDate?: Date;
  rejectionReason?: string;

  subscription: {
    planId?: mongoose.Types.ObjectId;
    plan: string;
    amount: number;
    status: "active" | "expired" | "cancelled";
    startDate?: Date;
    endDate?: Date;
    pendingPlanId?: mongoose.Types.ObjectId;
    pendingPlanName?: string;
    pendingActivationDate?: Date;
    upgradeType?: "upgrade" | "downgrade" | "new" | "activate_downgrade";
  };

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------- Image Limit Validator ---------------- */

const maxImagesValidator = {
  validator: (val: string[]) => val.length <= 3,
  message: "Maximum 3 images allowed",
};

/* ---------------- Schema ---------------- */

const HospitalSchema = new Schema<IHospital>(
  {
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
  type: String,
  enum: Object.values(Role),
  default: Role.HOSPITAL,
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

    autoDisabled: {
      type: Boolean,
      default: false,
    },

    /* ---------------- Images ---------------- */

    images: {
      landscape: {
        type: [String],
        default: [],
        validate: maxImagesValidator,
      },

      medicalTeam: {
        type: [String],
        default: [],
        validate: maxImagesValidator,
      },

      patientCare: {
        type: [String],
        default: [],
        validate: maxImagesValidator,
      },

      services: {
        type: [String],
        default: [],
        validate: maxImagesValidator,
      },
    },

    /* ---------------- Contact ---------------- */

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    /* ---------------- Hospital Info ---------------- */

    since: {
      type: Number,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    about: {
      type: String,
      default: "",
    },

    licence: {
      type: String,
      default: "",
    },

    /* ---------------- Finance ---------------- */

    income: {
      type: Number,
      default: 0,
    },

    /* ---------------- Review ---------------- */

    reviewStatus: {
      type: String,
      default: "pending",
    },

    reapplyDate: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    /* ---------------- Subscription ---------------- */

    subscription: {
      planId: {
        type: Schema.Types.ObjectId,
        ref: "Subscription"
      },

      plan: {
        type: String,
        default: "free",
      },

      amount: {
        type: Number,
        default: 0,
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

      pendingPlanId: {
        type: Schema.Types.ObjectId,
        ref: "Subscription"
      },

      pendingPlanName: {
        type: String,
      },

      pendingActivationDate: {
        type: Date,
      },

      upgradeType: {
        type: String,
        enum: ["upgrade", "downgrade", "new", "activate_downgrade"]
      }
    },
  },
  {
    timestamps: true,
  }
);

/* ---------------- Model ---------------- */

export const HospitalModel = mongoose.model<IHospital>(
  "Hospital",
  HospitalSchema
);