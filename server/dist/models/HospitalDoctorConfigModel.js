// models/HospitalDoctorConfig.model.ts
import { Schema, model } from "mongoose";
const hospitalDoctorConfigSchema = new Schema({
    hospitalId: {
        type: Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    doctorFee: {
        type: Number,
        required: true,
        min: [0, "Doctor fee cannot be negative"],
        default: 0,
    },
    hospitalCommission: {
        type: Number,
        required: true,
        min: [0, "Commission cannot be negative"],
        default: 0,
    },
}, { timestamps: true });
export const HospitalDoctorConfigModel = model("HospitalDoctorConfig", hospitalDoctorConfigSchema);
