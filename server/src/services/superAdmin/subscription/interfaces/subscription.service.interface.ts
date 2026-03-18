import { SubscriptionResponseDTO, CreateSubscriptionDTO, UpdateSubscriptionDTO } from "../../../../dto/subscription/subscription-response.dto.ts";

export interface ISubscriptionResult {
    data: SubscriptionResponseDTO[];
    total: number;
}

export interface ISubscriptionService {
    addSubscription(data: CreateSubscriptionDTO): Promise<SubscriptionResponseDTO>;
    getAllSubscriptions(page: number, limit: number, search: string, status: string): Promise<ISubscriptionResult>;
    toggleSubscription(id: string, isActive: boolean): Promise<SubscriptionResponseDTO | null>;
    updateSubscription(id: string, updateData: UpdateSubscriptionDTO): Promise<SubscriptionResponseDTO | null>;
}
