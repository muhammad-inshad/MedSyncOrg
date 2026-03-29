import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";
import { IPrescription } from "../../models/prescription.model.ts";
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