import mongoose, { Schema } from "mongoose";
const OtpSchema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: 59 } },
});
export const OtpModel = mongoose.model("Otp", OtpSchema);
