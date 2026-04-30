import mongoose, { Schema, Document, Types } from "mongoose";



export interface IWallet extends Document {
  ownerId: Types.ObjectId;
  balance: number;
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
  },
  {
    timestamps: true,
  }
);

export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);