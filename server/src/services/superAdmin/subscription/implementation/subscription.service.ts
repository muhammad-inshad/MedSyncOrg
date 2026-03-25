import { ISubscriptionRepository } from "../../../../repositories/superAdmin/subscription/interfaces/subscription.repository.interface.ts";
import { ISubscriptionService, ISubscriptionResult } from "../interfaces/subscription.service.interface.ts";
import { SubscriptionMapper } from "../../../../mappers/subscription.mapper.ts";
import { CreateSubscriptionDTO, UpdateSubscriptionDTO, SubscriptionResponseDTO, CreateSubscription } from "../../../../dto/subscription/subscription-response.dto.ts";
import { ISubscription } from "../../../../models/subscription.ts";
import { Types } from "mongoose";

export class SubscriptionService implements ISubscriptionService {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly subscriptionMapper: SubscriptionMapper
    ) {}

  
 async createSubscription(data: CreateSubscription): Promise<CreateSubscription> {

  const startDate = new Date();
  const endDate = new Date(startDate);

  switch (data.durationUnit) {

    case "months":
      endDate.setMonth(endDate.getMonth() + data.duration);
      break;

    case "years":
      endDate.setFullYear(endDate.getFullYear() + data.duration);
      break;

    default:
      throw new Error("Invalid duration unit");
  }

  const result = await this.subscriptionRepository.create({
    planName: data.planName,
    description: data.description,
    duration: data.duration,
    durationUnit: data.durationUnit,
    amount: data.amount,
    startDate,  
    endDate     
  });

  return result;
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

  async toggleSubscription(
  id: string,
  isActive: boolean
): Promise<SubscriptionResponseDTO | null> {

  const status: "active" | "cancelled" = isActive
    ? "active"
    : "cancelled";
  const updated = await this.subscriptionRepository.updateById(
    id,
    { status } 
  );
  return updated ? this.subscriptionMapper.toDTO(updated) : null;
}
    async updateSubscription(id: string, updateData: UpdateSubscriptionDTO): Promise<SubscriptionResponseDTO | null> {
        const updated = await this.subscriptionRepository.updateById(id, updateData as Partial<ISubscription>);
        return updated ? this.subscriptionMapper.toDTO(updated) : null;
    }
}
