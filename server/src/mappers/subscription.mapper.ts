import { IMapper } from "../interfaces/mapper.interface.ts";
import { ISubscription } from "../models/subscription.ts";
import { SubscriptionResponseDTO, SubscriptionResponseSchema } from "../dto/subscription/subscription-response.dto.ts";

export class SubscriptionMapper implements IMapper<ISubscription, SubscriptionResponseDTO> {
    toDTO(subscription: ISubscription): SubscriptionResponseDTO {
        const dto = {
            id: subscription._id.toString(),
            plan: subscription.plan,
            amount: subscription.amount,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            planName: subscription.planName,
            price: subscription.price,
            duration: subscription.duration,
            durationUnit: subscription.durationUnit,
            features: subscription.features,
            isActive: subscription.isActive,
            planType: subscription.planType,
            description: subscription.description,
            limits: subscription.limits,
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt,
        };

        return SubscriptionResponseSchema.parse(dto);
    }
}
