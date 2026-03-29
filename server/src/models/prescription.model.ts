import mongoose,{Schema,Document,Types} from "mongoose";

export interface IMedicine {
    name: string;
    dosage: string;
    duration: string;
}

export interface IPrescription extends Document {
     hospital_id: Types.ObjectId;
    patient_email: string;
    doctor_id: Types.ObjectId;
    appointment_id?: Types.ObjectId;
     medicines: IMedicine[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicine>(
    {
        name: { type: String, required: true }, 
        dosage: { type: String, required: true },
        duration: { type: String, required: true }
    }
);

const PrescriptionSchema = new Schema<IPrescription>(
    {
        hospital_id: { type: Schema.Types.ObjectId, ref: "Hospital", required: true },
        patient_email: { type: String , required: true },
        doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor" ,required: true },
        appointment_id: { type: Schema.Types.ObjectId },
        medicines: { type: [MedicineSchema], required: true },
        notes: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }
);

export default mongoose.model<IPrescription>("Prescription", PrescriptionSchema);