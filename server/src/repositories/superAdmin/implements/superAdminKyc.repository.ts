import { BaseRepository } from "../../IBase/BaseRepository.js";
import { IHospital } from "../../../models/hospital.model.js";
import { IBaseRepository } from "../../IBase/IBaseRepository.interface.js";

export class KycRepository extends BaseRepository<IHospital> implements IBaseRepository<IHospital> {
    
}
