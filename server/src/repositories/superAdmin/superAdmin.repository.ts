import { BaseRepository } from "../IBase/BaseRepository.ts";
import { ISuperAdmin } from "../../models/superAdmin.model.ts";
import { ISuperAdminRepository } from "./superAdmin.repository.interface.ts";

export class SuperAdminRepository extends BaseRepository<ISuperAdmin> implements ISuperAdminRepository{
}
