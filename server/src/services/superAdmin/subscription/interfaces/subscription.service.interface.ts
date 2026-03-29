import { HospitalResponseDTO } from "../../../../dto/hospital/hospital-response.dto.ts";
import { CreateSubscription, SubscriptionResponseDTO, UpdateSubscriptionDTO } from "../../../../dto/subscription/subscription-response.dto.ts";
import { IHospital } from "../../../../models/hospital.model.ts";
import { ISubscription } from "../../../../models/subscription.ts";

export interface ISubscriptionResult {
    data: SubscriptionResponseDTO[];
    total: number;
}

export interface ISubscriptionService {
     createSubscription(data: {
    planName: string;
    description: string;
    duration: number;
    durationUnit: "months" | "years";
    amount: number;
  }): Promise<CreateSubscription>;
    getAllSubscriptions(page: number, limit: number, search: string, status: string): Promise<ISubscriptionResult>;
    toggleSubscription(id: string, isActive: boolean): Promise<SubscriptionResponseDTO | null>;
    updateSubscription(id: string, updateData: UpdateSubscriptionDTO): Promise<SubscriptionResponseDTO | null>;
    subscribeHospital(page:number,limit:number, search:string):Promise<HospitalResponseDTO[]>
}
