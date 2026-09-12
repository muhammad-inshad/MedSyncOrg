import { BaseRepository } from "../../IBase/BaseRepository.ts";
import { ISuperAdmin } from "../../../models/superAdmin.model.ts";
import { ISuperAdminRepository } from "../interfaces/superAdmin.repository.interface.ts";
import { FilterQuery } from "mongoose";

export class SuperAdminRepository extends BaseRepository<ISuperAdmin> implements ISuperAdminRepository {
    async findByEmailWithPassword(email: string): Promise<ISuperAdmin | null> {
        return await this.model.findOne({ email } as FilterQuery<ISuperAdmin>).select('+password').exec();
    }
}
