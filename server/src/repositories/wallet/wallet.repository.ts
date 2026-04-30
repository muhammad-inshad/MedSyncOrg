import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";
import { IWallet } from "../../models/wallet.model.ts";
import { IWalletRepository } from "./wallet.repository.interface.ts";
import { BaseRepository } from "../IBase/BaseRepository.ts";

export class WalletRepository extends BaseRepository<IWallet>implements IWalletRepository{

}