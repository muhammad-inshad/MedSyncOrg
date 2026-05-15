import mongoose, { Schema } from "mongoose";
const SubscriptionSchema = new Schema({
    planName: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    durationUnit: {
        type: String,
        enum: ["months", "years"],
        default: "months",
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        default: "active",
    },
}, {
    timestamps: true,
});
export const SubscriptionModel = mongoose.model("Subscription", SubscriptionSchema);
