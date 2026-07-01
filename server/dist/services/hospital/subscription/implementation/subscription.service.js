import { Types } from "mongoose";
import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
export class HospitalSubscriptionService {
    constructor(subscriptionRepository, hospitalRepository, doctorRepository, departmentRepository, userRepository, subscriptionMapper) {
        this.subscriptionRepository = subscriptionRepository;
        this.hospitalRepository = hospitalRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.subscriptionMapper = subscriptionMapper;
    }
    async getActiveSubscriptions(page, limit, search) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.subscriptionRepository.findAllWithPagination(skip, limit, search, "active"),
            this.subscriptionRepository.count(search, "active"),
        ]);
        return {
            data: data.map(s => this.subscriptionMapper.toDTO(s)),
            total,
        };
    }
    async checkSubscriptionLimit(hospitalId, type) {
        const hospital = await this.hospitalRepository.findById(hospitalId);
        console.log(type);
        if (!hospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Hospital not found");
        }
        const subscription = hospital.subscription;
        if (!subscription || !subscription.plan) {
            ApiResponse.throwError(HttpStatusCode.PAYMENT_REQUIRED, "No active subscription plan found. Please subscribe to continue.");
        }
        const currentDate = new Date();
        const isExpiredStatus = subscription.status === "expired";
        const isPastEndDate = subscription.endDate && new Date(subscription.endDate) < currentDate;
        if (isExpiredStatus || isPastEndDate) {
            ApiResponse.throwError(HttpStatusCode.PAYMENT_REQUIRED, "Your subscription has expired. Please renew your plan to continue.");
        }
        const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
        const planDetails = await this.subscriptionRepository.findByPlanName(planName);
        console.log(planDetails);
    }
    async protection(hospitalId) {
        const hospital = await this.hospitalRepository.findById(hospitalId);
        if (!hospital) {
            ApiResponse.throwError(404, "Hospital not found");
        }
        const subscription = hospital.subscription;
        if (!subscription)
            return false;
        if (!subscription.endDate)
            return false;
        const now = new Date();
        const endDate = new Date(subscription.endDate);
        if (subscription.status !== "active")
            return false;
        if (now > endDate)
            return false;
        return true;
    }
    async getCurrentSubscription(hospitalId) {
        const hospital = await this.hospitalRepository.findById(hospitalId);
        if (!hospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Hospital not found");
        }
        const subscription = hospital.subscription;
        if (!subscription) {
            return null;
        }
        // Check if dynamically expired
        if (subscription.endDate && new Date() > new Date(subscription.endDate) && subscription.status === "active") {
            subscription.status = "expired";
        }
        return subscription;
    }
    async downgradeSubscription(hospitalId, newPlanId) {
        const hospital = await this.hospitalRepository.findById(hospitalId);
        if (!hospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Hospital not found");
        }
        const newPlan = await this.subscriptionRepository.findById(newPlanId);
        if (!newPlan) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Subscription plan not found");
        }
        if (!hospital.subscription || hospital.subscription.status !== "active") {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Cannot downgrade inactive subscription");
        }
        // Mark as pending downgrade
        await this.hospitalRepository.update(hospitalId, {
            subscription: {
                ...hospital.subscription,
                pendingPlanId: new Types.ObjectId(newPlanId),
                pendingPlanName: newPlan.planName,
                pendingActivationDate: hospital.subscription.endDate,
                upgradeType: "downgrade"
            }
        });
    }
}
