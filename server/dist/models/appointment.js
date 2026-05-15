import mongoose, { Schema } from "mongoose";
export var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING"] = "pending";
    AppointmentStatus["COMPLETED"] = "completed";
    AppointmentStatus["CANCELLED"] = "cancelled";
    AppointmentStatus["PROCESSING"] = "processing";
    AppointmentStatus["REJECTED"] = "rejected";
})(AppointmentStatus || (AppointmentStatus = {}));
export var AppointmentMode;
(function (AppointmentMode) {
    AppointmentMode["ONLINE"] = "online";
    AppointmentMode["OFFLINE"] = "offline";
})(AppointmentMode || (AppointmentMode = {}));
const appointmentSchema = new Schema({
    bookedBy: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    slotStartTime: { type: String, required: true },
    slotEndTime: { type: String, required: true },
    hospitalId: {
        type: Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    requsetRejectedReason: {
        type: String,
    },
    cancelRequest: {
        type: Boolean,
        default: false,
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    paymentstatus: {
        type: String,
    },
    tokenNumber: {
        type: Number,
        required: true,
    },
    visitTime: {
        type: String,
    },
    mode: {
        type: String,
        enum: Object.values(AppointmentMode),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(AppointmentStatus),
        default: AppointmentStatus.PENDING,
    },
    patientDetails: {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        address: { type: String },
    },
    rejectionReason: {
        type: String,
    },
    cancelReason: {
        type: String,
    },
    bloodPressure: {
        type: String,
    },
    heartRate: {
        type: String,
    },
    weight: {
        type: String,
    },
    paymentId: {
        type: String,
    },
    session: {
        type: String,
        enum: ["morning", "afternoon", "evening"]
    }
}, {
    timestamps: true,
});
export const AppointmentModel = mongoose.model("Appointment", appointmentSchema);
