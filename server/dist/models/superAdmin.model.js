import mongoose, { Schema } from "mongoose";
import { Role } from "../constants/enums.js";
const SuperAdminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.SUPER_ADMIN,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
export const SuperAdminModel = mongoose.model("SuperAdmin", SuperAdminSchema);
