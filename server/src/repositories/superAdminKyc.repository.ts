import { BaseRepository } from "./IBase/BaseRepository.ts";
import { IAdmin } from "../models/admin.model.ts";
// Note: superAdmin.di.ts initializes KycRepository with AdminModel. 
// If it needs to support DoctorModel too, it should be generic or union.
// But mostly KYC seems to be for Admins (Hospitals) based on superAdminkyc.service.ts
import { IBaseRepository } from "../interfaces/IBaseRepository.ts";

export class KycRepository extends BaseRepository<IAdmin> implements IBaseRepository<IAdmin> {
    // This repository handles Admin entities for KYC purposes
}
