import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IDoctor } from "../../models/doctor.model.ts";
import { IDoctorRepository } from "./doctor.repository.interface.ts";


export class DoctorRepository extends BaseRepository<IDoctor> implements IDoctorRepository {
    
}
