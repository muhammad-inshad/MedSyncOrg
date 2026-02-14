import { BaseRepository } from "./BaseRepository.ts";
import { IPatient } from "../models/Patient.model.ts";
import { IBaseRepository } from "../interfaces/IBaseRepository.ts";

export class UserRepository extends BaseRepository<IPatient> implements IBaseRepository<IPatient> {
    // Add specific methods for User here if needed
}
