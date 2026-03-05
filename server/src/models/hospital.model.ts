import mongoose, { Schema, Document } from "mongoose";

export interface IHospital extends Document {
  hospitalName: string;
  logo?: string;
  address: string;
  password: string;

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
    plan: "free" | "basic" | "premium";
    amount: number;
    status: "active" | "expired" | "cancelled";
    startDate?: Date;
    endDate?: Date;
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
      enum: ["pending", "approved", "revision", "rejected"],
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
      plan: {
        type: String,
        enum: ["free", "basic", "premium"],
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