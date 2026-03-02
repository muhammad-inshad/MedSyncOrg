import mongoose, { Schema, Document } from "mongoose";

export interface IHospital extends Document {
    hospitalName: string;
    logo?: string;
    address: string;
    password: string;
    isActive: boolean;
    autoDisabled: boolean;

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

const HospitalSchema = new Schema<IHospital>(
    {
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
    },
    {
        timestamps: true,
    }
);


export const HospitalModel = mongoose.model<IHospital>(
    "Hospital",
    HospitalSchema
);
