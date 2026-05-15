import mongoose, { Schema } from "mongoose";
const DepartmentSchema = new Schema({
    hospital_id: {
        type: Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    departmentName: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
    },
    description: {
        type: String,
    },
    doctors: [
        {
            type: Schema.Types.ObjectId,
            ref: "Doctor",
        },
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
export default mongoose.model("Department", DepartmentSchema);
