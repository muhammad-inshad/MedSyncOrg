import { Schema, model } from "mongoose";
const doctorLeaveSchema = new Schema({
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    leaveSession: {
        type: String,
        enum: ["morning", "afternoon", "evening", "night"],
    },
    reason: {
        type: String,
    },
    rejectedReson: {
        type: String,
    },
    photo: {
        type: String,
    },
    status: {
        type: String,
        enum: ["approved", "pending", "rejected"],
        default: "pending",
    },
}, { timestamps: true });
export default model("DoctorLeave", doctorLeaveSchema);
