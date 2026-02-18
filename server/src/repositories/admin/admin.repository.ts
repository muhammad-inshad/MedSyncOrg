import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IAdmin } from "../../models/admin.model.ts";
import { IAdminRepository } from "./admin.repository.interface.ts";

export class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository {
   
}
