import mongoose, { Schema } from "mongoose";
const walletSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    Transaction: [
        {
            amount: { type: Number, required: true },
            type: { type: String, enum: ["credit", "debit"], required: true },
            date: { type: Date, default: Date.now },
        },
    ],
    totalearnings: {
        type: Number,
        default: 0,
    },
    totalwithdrawn: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
export const Wallet = mongoose.model("Wallet", walletSchema);
