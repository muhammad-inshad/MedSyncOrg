import { IBaseRepository } from "../IBase/IBaseRepository.interface.js";

import { IWallet } from "../../models/wallet.model.js";

export interface IWalletRepository extends IBaseRepository<IWallet> {
  creditWallet(ownerId: string, amount: number): Promise<IWallet | null>;
  debitWallet(ownerId: string, amount: number): Promise<IWallet | null>;
}