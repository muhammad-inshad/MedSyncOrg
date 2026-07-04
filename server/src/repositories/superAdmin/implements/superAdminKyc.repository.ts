import { BaseRepository } from "../../IBase/BaseRepository.ts";
import { IHospital } from "../../../models/hospital.model.ts";
import { IBaseRepository } from "../../IBase/IBaseRepository.interface.ts";

export class KycRepository extends BaseRepository<IHospital> implements IBaseRepository<IHospital> {
    
}
