import mongoose, { Schema, Document, Types } from "mongoose";


export interface IWallet extends Document {
  ownerId: Types.ObjectId;
  balance: number;
  totalearnings?: number;
  totalwithdrawn?: number;
  Transaction?: {
    amount: number;
    type: "credit" | "debit";
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
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
  },

  {
    timestamps: true,
  }
);

export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);