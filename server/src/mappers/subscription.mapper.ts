import { IMapper } from "../interfaces/mapper.interface.ts";
import { ISubscription } from "../models/subscription.ts";
import { SubscriptionResponseDTO, SubscriptionResponseSchema } from "../dto/subscription/subscription-response.dto.ts";

export class SubscriptionMapper implements IMapper<ISubscription, SubscriptionResponseDTO> {
 toDTO(subscription: ISubscription): SubscriptionResponseDTO {
    const dto = {
        id: subscription._id.toString(),
        amount: subscription.amount,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        planName: subscription.planName,
        duration: subscription.duration,
        durationUnit: subscription.durationUnit,
        description: subscription.description,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
    };

    try {
        return SubscriptionResponseSchema.parse(dto);
    } catch (error) {
        console.error("ZOD ERROR:", error);
        throw error;
    }
}
}
