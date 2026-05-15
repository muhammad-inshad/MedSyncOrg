import { BaseRepository } from "../IBase/BaseRepository.js";
export class WalletRepository extends BaseRepository {
    async creditWallet(ownerId, amount) {
        return await this.model.findOneAndUpdate({ ownerId }, {
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
        }, { new: true, upsert: true });
    }
    async debitWallet(ownerId, amount) {
        const wallet = await this.model.findOne({ ownerId });
        if (!wallet) {
            throw new Error("Wallet not found");
        }
        if (wallet.balance < amount) {
            throw new Error("Insufficient balance");
        }
        return await this.model.findOneAndUpdate({ ownerId }, {
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
        }, { new: true });
    }
}
