import mongoose, { Schema } from "mongoose";
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
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
export const SuperAdminModel = mongoose.model("SuperAdmin", SuperAdminSchema);
