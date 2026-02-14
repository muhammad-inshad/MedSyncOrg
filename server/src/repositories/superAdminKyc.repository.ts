import { BaseRepository } from "./BaseRepository.ts";
import { IAdmin } from "../models/admin.model.ts";
import { IBaseRepository } from "../interfaces/IBaseRepository.ts";

export class KycRepository extends BaseRepository<IAdmin> implements IBaseRepository<IAdmin> {
    // Add specific methods for KYC/Hospitals here if needed
}
