import mongoose, { Schema } from "mongoose";
const MedicineSchema = new Schema({
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    duration: { type: String, required: true }
});
const PrescriptionSchema = new Schema({
    hospital_id: { type: Schema.Types.ObjectId, ref: "Hospital", required: true },
    patient_email: { type: String, required: true },
    doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointment_id: { type: Schema.Types.ObjectId },
    medicines: { type: [MedicineSchema], required: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export default mongoose.model("Prescription", PrescriptionSchema);
