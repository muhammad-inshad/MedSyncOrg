import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IHospital } from "../../models/hospital.model.ts";
import { IHospitalRepository } from "./hospital.repository.interface.ts";

export class HospitalRepository extends BaseRepository<IHospital> implements IHospitalRepository {

}
