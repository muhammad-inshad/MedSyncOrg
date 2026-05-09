
import { IWallet } from "../../models/wallet.model.ts";
import { IWalletRepository } from "./wallet.repository.interface.ts";
import { BaseRepository } from "../IBase/BaseRepository.ts";

export class WalletRepository
  extends BaseRepository<IWallet>
  implements IWalletRepository {

  async creditWallet(ownerId: string, amount: number): Promise<IWallet | null> {
    return await this.model.findOneAndUpdate(
      { ownerId },
      {
        $inc: {
          balance: amount,
          totalearnings: amount,
        },
        $push: {
          Transaction: {
            amount,
            type: "credit",
            date: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );
  }

  async debitWallet(ownerId: string, amount: number): Promise<IWallet | null> {
    const wallet = await this.model.findOne({ ownerId });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    return await this.model.findOneAndUpdate(
      { ownerId },
      {
        $inc: {
          balance: -amount,
          totalwithdrawn: amount,
        },
        $push: {
          Transaction: {
            amount,
            type: "debit",
            date: new Date(),
          },
        },
      },
      { new: true }
    );
  }
}