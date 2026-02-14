import { BaseRepository } from "./BaseRepository.ts";
import { IDoctor } from "../models/doctor.model.ts";
import { IBaseRepository } from "../interfaces/IBaseRepository.ts";

export class DoctorRepository extends BaseRepository<IDoctor> implements IBaseRepository<IDoctor> {
    // Add specific methods for Doctor here if needed
}
