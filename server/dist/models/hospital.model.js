import mongoose, { Schema } from "mongoose";
import { Role } from "../constants/enums.js";
/* ---------------- Image Limit Validator ---------------- */
const maxImagesValidator = {
    validator: (val) => val.length <= 3,
    message: "Maximum 3 images allowed",
};
/* ---------------- Schema ---------------- */
const HospitalSchema = new Schema({
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
    },
}, {
    timestamps: true,
});
/* ---------------- Model ---------------- */
export const HospitalModel = mongoose.model("Hospital", HospitalSchema);
