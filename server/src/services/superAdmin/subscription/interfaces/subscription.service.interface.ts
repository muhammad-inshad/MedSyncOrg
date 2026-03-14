import { ISubscription } from "../../../../models/subscription.ts";

export interface ISubscriptionService {
    addSubscription(data: Partial<ISubscription>): Promise<ISubscription>;
    getAllSubscriptions(page: number, limit: number, search: string, status: string): Promise<{ data: ISubscription[], total: number }>;
    toggleSubscription(id: string, isActive: boolean): Promise<ISubscription | null>;
    updateSubscription(id: string, updateData: Partial<ISubscription>): Promise<ISubscription | null>;
}
