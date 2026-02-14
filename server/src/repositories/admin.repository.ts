import { BaseRepository } from "./BaseRepository.ts";
import { IAdmin, AdminModel } from "../models/admin.model.ts";
import { IBaseRepository } from "../interfaces/IBaseRepository.ts";

export class AdminRepository extends BaseRepository<IAdmin> implements IBaseRepository<IAdmin> {
}
