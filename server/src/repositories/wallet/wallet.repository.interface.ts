import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

import { IWallet } from "../../models/wallet.model.ts";

export interface IWalletRepository extends IBaseRepository<IWallet> {   }