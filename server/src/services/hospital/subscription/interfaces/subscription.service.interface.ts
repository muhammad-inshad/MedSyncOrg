import { ISubscription } from "../../../../models/subscription.ts";

export interface IHospitalSubscriptionService {
    getActiveSubscriptions(page: number, limit: number, search: string): Promise<{ data: ISubscription[]; total: number }>;
    checkSubscriptionLimit(hospitalId: string, type: "maxDoctors" | "maxPatients" | "maxDepartments"): Promise<void>;
}
