import { BaseRepository } from "./BaseRepository.ts";
import { ISuperAdmin } from "../models/superAdmin.model.ts";
import { IBaseRepository } from "../interfaces/IBaseRepository.ts";

export class SuperAdminRepository extends BaseRepository<ISuperAdmin> implements IBaseRepository<ISuperAdmin> {
    // Add specific methods for Super Admin here if needed
}
