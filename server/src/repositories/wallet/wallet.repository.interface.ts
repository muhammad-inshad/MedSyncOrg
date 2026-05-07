import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

import { IWallet } from "../../models/wallet.model.ts";

export interface IWalletRepository extends IBaseRepository<IWallet> {
  creditWallet(ownerId: string, amount: number): Promise<IWallet | null>;
  debitWallet(ownerId: string, amount: number): Promise<IWallet | null>;
}