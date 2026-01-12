import { Schema, model, Document, Types } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;         

  specialization: string;
  qualification: string;
  experience: string;        
  department: string;
  hospital_id: Types.ObjectId;
  about: string;           

  licence: string;           
  profileImage: string;      

  rating: number;
  reviewCount: number;

  isActive: boolean;
  isSelected: boolean;
  walletBalance: number;

  availableSlots: string[];

  consultationTime: {
    start: string;  
    end: string;   
  };

  // UPDATED: Match frontend exactly
  payment: {
    type: "commission" | "fixed";
    commissionPercentage?: number;
    fixedSalary?: number;
    payoutCycle: "weekly" | "monthly";
    patientsPerDayLimit: number;  // NEW: required from frontend
  };

  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },

    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },

    //  NEW: Address field
    address: {
      type: String,
      required: [true, 'Address is required'],
    },

    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
    },

    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
    },

    // CHANGED: String instead of Number to match frontend
    experience: {
      type: String,
      required: [true, 'Experience is required'],
    },

    department: {
      type: String,
      required: [true, 'Department is required'],
    },

    hospital_id: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    //Medical license image URL (from frontend 'license')
    licence: {
      type: String,
      required: [true, 'Medical license is required'],
    },

    // Profile image URL (from frontend 'profileImage')
    profileImage: {
      type: String,
      required: [true, 'Profile image is required'],
    },

    about: {
      type: String,
      required: [true, 'About is required'],  //  Made required
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isSelected: {
      type: Boolean,
      default: false,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    availableSlots: {
      type: [String],
      default: [],
    },

    consultationTime: {
      start: {
        type: String,
        required: [true, 'Start time is required'],
      },
      end: {
        type: String,
        required: [true, 'End time is required'],
      },
    },

    payment: {
      type: {
        type: String,
        enum: ["commission", "fixed"],
        required: [true, 'Salary type is required'],
      },

      commissionPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },

      fixedSalary: {
        type: Number,
      },

      payoutCycle: {
        type: String,
        enum: ["weekly", "monthly"],
        required: [true, 'Payout cycle is required'],
      },

      // NEW: From frontend patientsPerDay
      patientsPerDayLimit: {
        type: Number,
        required: [true, 'Patients per day is required'],
      },
    },
  },
  {
    timestamps: true,
  }
);

export const DoctorModel = model<IDoctor>("Doctor", doctorSchema);
