import { Schema, model } from "mongoose";
import { Role } from "../constants/enums.js";
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
    address: {
        type: String,
        required: [true, 'Address is required'],
    },
    specialization_id: {
        type: String,
        required: [true, 'Specialization is required'],
    },
    qualification: {
        type: String,
        required: [true, 'Qualification is required'],
    },
    experience: {
        type: String,
        required: [true, 'Experience is required'],
    },
    department_id: {
        type: String,
        required: [true, 'Department is required'],
    },
    hospital_id: {
        type: Schema.Types.ObjectId,
        ref: "Hospital",
        required: false,
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.DOCTOR,
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
    salary: {
        type: Number,
        default: 0,
        required: false
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
}, {
    timestamps: true,
});
export const DoctorModel = model("Doctor", doctorSchema);
