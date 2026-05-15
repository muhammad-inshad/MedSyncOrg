import { IBaseRepository } from "../IBase/IBaseRepository.interface.js";
import { IPrescription } from "../../models/prescription.model.js";
import { FilterQuery } from "mongoose";
export interface IPrescriptionRepository extends IBaseRepository<IPrescription> {
   findPrescriptionsPaginated(options: { 
    email: string;
    page: number; 
    limit: number;
    search?: string;
    filter?: FilterQuery<IPrescription>
  }): Promise<{ data: IPrescription[]; total: number; page: number; limit: number }>;

}