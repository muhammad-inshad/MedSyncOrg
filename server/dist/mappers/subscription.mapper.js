import { SubscriptionResponseSchema } from "../dto/subscription/subscription-response.dto.js";
export class SubscriptionMapper {
    toDTO(subscription) {
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
        }
        catch (error) {
            console.error("ZOD ERROR:", error);
            throw error;
        }
    }
}
