import { IQualification } from "../../models/qualification.model.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export interface IQualificationRepository extends IBaseRepository<IQualification> {
    findByHospitalId(hospitalId: string): Promise<IQualification[]>;
}
