import { BaseRepository } from "../../IBase/BaseRepository.js";
import { ISuperAdmin } from "../../../models/superAdmin.model.js";
import { ISuperAdminRepository } from "../interfaces/superAdmin.repository.interface.js";

export class SuperAdminRepository extends BaseRepository<ISuperAdmin> implements ISuperAdminRepository {
}
