import mongoose, { Schema, Document, Types } from "mongoose";

export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export interface ITransaction extends Document {
  walletId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);