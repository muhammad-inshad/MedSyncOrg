import { ISubscriptionRepository } from "../../../../repositories/superAdmin/subscription/interfaces/subscription.repository.interface.ts";
import { ISubscriptionService, ISubscriptionResult } from "../interfaces/subscription.service.interface.ts";
import { SubscriptionMapper } from "../../../../mappers/subscription.mapper.ts";
import { CreateSubscriptionDTO, UpdateSubscriptionDTO, SubscriptionResponseDTO } from "../../../../dto/subscription/subscription-response.dto.ts";
import { ISubscription } from "../../../../models/subscription.ts";

export class SubscriptionService implements ISubscriptionService {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly subscriptionMapper: SubscriptionMapper
    ) {}

    async addSubscription(data: CreateSubscriptionDTO): Promise<SubscriptionResponseDTO> {
        const created = await this.subscriptionRepository.create(data as Partial<ISubscription>);
        return this.subscriptionMapper.toDTO(created);
    }

    async getAllSubscriptions(page: number, limit: number, search: string = "", status: string = "All"): Promise<ISubscriptionResult> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.subscriptionRepository.findAllWithPagination(skip, limit, search, status),
            this.subscriptionRepository.count(search, status)
        ]);
        
        return { 
            data: data.map(s => this.subscriptionMapper.toDTO(s)), 
            total 
        };
    }

    async toggleSubscription(id: string, isActive: boolean): Promise<SubscriptionResponseDTO | null> {
        const updated = await this.subscriptionRepository.updateById(id, { isActive } as Partial<ISubscription>);
        return updated ? this.subscriptionMapper.toDTO(updated) : null;
    }

    async updateSubscription(id: string, updateData: UpdateSubscriptionDTO): Promise<SubscriptionResponseDTO | null> {
        const updated = await this.subscriptionRepository.updateById(id, updateData as Partial<ISubscription>);
        return updated ? this.subscriptionMapper.toDTO(updated) : null;
    }
}
