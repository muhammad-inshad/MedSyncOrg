import mongoose, { Schema } from "mongoose";
const patientSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: false },
    password: { type: String, required: false },
    isGoogleAuth: { type: Boolean, default: false },
    fatherName: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: { type: Date },
    address: { type: String },
    isActive: { type: Boolean },
    image: { type: String },
    bloodGroup: { type: String },
    walletBalance: { type: Number, default: 0 },
    medicalReports: { type: [String], default: [] },
    hospital_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
    },
    appointmentHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        },
    ],
    isProfileComplete: { type: Boolean, default: false },
}, {
    timestamps: true,
});
export const Patient = mongoose.model("Patient", patientSchema);
