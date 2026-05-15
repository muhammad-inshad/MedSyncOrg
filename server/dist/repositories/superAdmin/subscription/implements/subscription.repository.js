import { BaseRepository } from "../../../IBase/BaseRepository.js";
import { SubscriptionModel } from "../../../../models/subscription.js";
import { HospitalModel } from "../../../../models/hospital.model.js";
export class SubscriptionRepository extends BaseRepository {
    constructor() {
        super(SubscriptionModel);
    }
    buildQuery(search, status) {
        const query = {};
        if (search && search.trim() !== "") {
            query.$or = [
                { planName: { $regex: search, $options: "i" } }
            ];
        }
        if (status && status !== "All") {
            const normalizedStatus = status.toLowerCase();
            if (normalizedStatus === "active") {
                query.status = "active";
            }
            else if (normalizedStatus === "inactive") {
                query.status = { $in: ["expired", "cancelled"] };
            }
            else if (normalizedStatus === "expired" ||
                normalizedStatus === "cancelled") {
                query.status = normalizedStatus;
            }
        }
        return query;
    }
    async findAllWithPagination(skip, limit, search, status) {
        const query = this.buildQuery(search, status);
        return await SubscriptionModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();
    }
    async count(search, status) {
        const query = this.buildQuery(search, status);
        return await SubscriptionModel.countDocuments(query).exec();
    }
    async updateById(id, updateData) {
        return await SubscriptionModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }
    async findByPlanName(planName) {
        return await SubscriptionModel.findOne({
            planName: { $regex: new RegExp(`^${planName}$`, "i") },
            status: "active",
        }).exec();
    }
    async updateExpiredSubscription() {
        const now = new Date();
        await HospitalModel.updateMany({
            "subscription.endDate": { $lt: now },
            "subscription.status": "active"
        }, {
            $set: { "subscription.status": "expired" }
        });
    }
    async findHospitalWithSubscrib(skip, limit, search, filter) {
        await this.updateExpiredSubscription();
        const query = { ...filter, reviewStatus: "approved" };
        if (search && search.trim() !== "") {
            query.hospitalName = { $regex: search, $options: "i" };
        }
        return HospitalModel.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();
    }
}
