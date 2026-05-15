export class SubscriptionService {
    constructor(subscriptionRepository, subscriptionMapper, _hospitalMapper) {
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionMapper = subscriptionMapper;
        this._hospitalMapper = _hospitalMapper;
    }
    async createSubscription(data) {
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
    async getAllSubscriptions(page, limit, search = "", status = "All") {
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
    async toggleSubscription(id, isActive) {
        const status = isActive
            ? "active"
            : "cancelled";
        const updated = await this.subscriptionRepository.updateById(id, { status });
        return updated ? this.subscriptionMapper.toDTO(updated) : null;
    }
    async updateSubscription(id, updateData) {
        const updated = await this.subscriptionRepository.updateById(id, updateData);
        return updated ? this.subscriptionMapper.toDTO(updated) : null;
    }
    async subscribeHospital(page, limit, search, filter) {
        const skip = (page - 1) * limit;
        const qury = {};
        if (filter === "active") {
            qury.isActive = true;
        }
        else if (filter === "expired") {
            qury.isActive = false;
        }
        const hospital = await this.subscriptionRepository.findHospitalWithSubscrib(skip, limit, search, qury);
        const mappedHospitals = hospital.map((h) => this._hospitalMapper.toDTO(h));
        return mappedHospitals;
    }
}
