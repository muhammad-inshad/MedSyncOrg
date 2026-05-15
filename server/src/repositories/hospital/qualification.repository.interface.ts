import { IQualification } from "../../models/qualification.model.js";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.js";

export interface IQualificationRepository extends IBaseRepository<IQualification> {
    findByHospitalId(hospitalId: string): Promise<IQualification[]>;
}
