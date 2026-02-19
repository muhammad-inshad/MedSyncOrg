import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
    email: string;
    otp: string;
    createdAt: Date;
}

const OtpSchema: Schema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: 59 } }, 
});

export const OtpModel = mongoose.model<IOtp>("Otp", OtpSchema);
