import mongoose, { Schema } from "mongoose";
const AdminSchema = new Schema({
    hospitalName: {
        type: String,
        required: true,
        trim: true,
    },
    logo: {
        type: String,
    },
    address: {
        type: String,
        required: true,
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
    },
    since: {
        type: Number,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    about: {
        type: String,
    },
    licence: {
        type: String,
    },
    income: {
        type: Number,
        default: 0,
    },
    reviewStatus: {
        type: String,
        enum: ["pending", "approved", "Revision", "rejected"],
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
        startDate: Date,
        endDate: Date,
    },
}, {
    timestamps: true,
});
export const AdminModel = mongoose.model("Admin", AdminSchema);
