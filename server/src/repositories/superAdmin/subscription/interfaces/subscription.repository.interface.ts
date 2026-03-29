import { IHospital } from "../../../../models/hospital.model.ts";
import { ISubscription } from "../../../../models/subscription.ts";
import { IBaseRepository } from "../../../IBase/IBaseRepository.interface.ts";

export interface ISubscriptionRepository extends IBaseRepository<ISubscription> {
    findAllWithPagination(skip: number, limit: number, search: string, status: string): Promise<ISubscription[]>;
    count(search: string, status: string): Promise<number>;
    updateById(id: string, updateData: Partial<ISubscription>): Promise<ISubscription | null>;
    findByPlanName(planName: string): Promise<ISubscription | null>;
    findHospitalWithSubscrib(skip: number, limit: number, search: string,):Promise<IHospital[]>
}
