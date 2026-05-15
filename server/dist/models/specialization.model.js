import mongoose, { Schema } from "mongoose";
const SpecializationSchema = new Schema({
    hospital_id: {
        type: Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    department_id: {
        type: Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
export default mongoose.model("Specialization", SpecializationSchema);
