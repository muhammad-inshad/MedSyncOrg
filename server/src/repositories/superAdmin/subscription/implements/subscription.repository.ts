import { BaseRepository } from "../../../IBase/BaseRepository.ts";
import { FilterQuery } from "mongoose";
import { ISubscription } from "../../../../models/subscription.ts";
import { ISubscriptionRepository } from "../interfaces/subscription.repository.interface.ts";
import { SubscriptionModel } from "../../../../models/subscription.ts";

export class SubscriptionRepository extends BaseRepository<ISubscription> implements ISubscriptionRepository {
    constructor() {
        super(SubscriptionModel);
    }

    private buildQuery(search: string, status: string): FilterQuery<ISubscription> {
        const query: FilterQuery<ISubscription> = {};
        
        if (search) {
            query.$or = [
                { planName: { $regex: search, $options: "i" } },
                { plan: { $regex: search, $options: "i" } } // Fallback to old property
            ];
        }

        if (status && status !== "All") {
            query.isActive = status === "Active";
        }

        return query;
    }

    async findAllWithPagination(skip: number, limit: number, search: string, status: string): Promise<ISubscription[]> {
        const query = this.buildQuery(search, status);
        return await SubscriptionModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    }

    async count(search: string, status: string): Promise<number> {
        const query = this.buildQuery(search, status);
        return await SubscriptionModel.countDocuments(query);
    }

    async updateById(id: string, updateData: Partial<ISubscription>): Promise<ISubscription | null> {
        return await SubscriptionModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async findByPlanName(planName: string): Promise<ISubscription | null> {
        return await SubscriptionModel.findOne({
            $or: [
                { planName: { $regex: new RegExp(`^${planName}$`, "i") } },
                { plan: { $regex: new RegExp(`^${planName}$`, "i") } }
            ],
            isActive: true
        });
    }
}
