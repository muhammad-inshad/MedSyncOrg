import { ISubscription } from "../../../../models/subscription.ts";
import { ISubscriptionRepository } from "../../../../repositories/superAdmin/subscription/interfaces/subscription.repository.interface.ts";
import { ISubscriptionService } from "../interfaces/subscription.service.interface.ts";

export class SubscriptionService implements ISubscriptionService {
    constructor(private readonly subscriptionRepository: ISubscriptionRepository) {}

    async addSubscription(data: Partial<ISubscription>): Promise<ISubscription> {
        return await this.subscriptionRepository.create(data);
    }

    async getAllSubscriptions(page: number, limit: number, search: string = "", status: string = "All"): Promise<{ data: ISubscription[], total: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.subscriptionRepository.findAllWithPagination(skip, limit, search, status),
            this.subscriptionRepository.count(search, status)
        ]);
        
        return { data, total };
    }

    async toggleSubscription(id: string, isActive: boolean): Promise<ISubscription | null> {
        return await this.subscriptionRepository.updateById(id, { isActive });
    }

    async updateSubscription(id: string, updateData: Partial<ISubscription>): Promise<ISubscription | null> {
        return await this.subscriptionRepository.updateById(id, updateData);
    }
}
