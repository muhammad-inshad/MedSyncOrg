import { Schema, model } from "mongoose";
const doctorSchema = new Schema({
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
        required: false,
    },
    licence: {
        type: String,
        required: [true, 'Medical license is required'],
    },
    profileImage: {
        type: String,
        required: [true, 'Profile image is required'],
    },
    about: {
        type: String,
        required: [true, 'About is required'],
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
        default: false,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
    walletBalance: {
        type: Number,
        default: 0,
    },
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
    availableSlots: {
        type: [String],
        default: [],
    },
    consultationTime: {
        start: {
            type: String,
            required: false,
        },
        end: {
            type: String,
            required: false,
        },
    },
    payment: {
        type: {
            type: String,
            enum: ["commission", "fixed"],
            required: false,
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
            required: false,
        },
        patientsPerDayLimit: {
            type: Number,
            required: false,
        },
    },
}, {
    timestamps: true,
});
export const DoctorModel = model("Doctor", doctorSchema);
