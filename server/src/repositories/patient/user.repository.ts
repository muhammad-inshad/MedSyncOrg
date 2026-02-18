import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IPatient } from "../../models/Patient.model.ts";
import { IUserRepository } from "./user.repository.interface.ts";

export class UserRepository extends BaseRepository<IPatient> implements IUserRepository {
}
