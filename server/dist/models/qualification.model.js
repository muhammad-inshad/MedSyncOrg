import mongoose, { Schema } from "mongoose";
const QualificationSchema = new Schema({
    hospital_id: {
        type: Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    abbreviation: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
    },
    description: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
export default mongoose.model("Qualification", QualificationSchema);
