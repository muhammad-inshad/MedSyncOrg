import { ISubscriptionRepository } from "../../../../repositories/superAdmin/subscription/interfaces/subscription.repository.interface.ts";
import { IHospitalSubscriptionService } from "../interfaces/subscription.service.interface.ts";
import { ISubscription } from "../../../../models/subscription.ts";
import { IHospitalRepository } from "../../../../repositories/hospital/hospital.repository.interface.ts";
import { IDoctorRepository } from "../../../../repositories/doctor/doctor.repository.interface.ts";
import { IDepartmentRepository } from "../../../../repositories/hospital/department.repository.interface.ts";
import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.ts";
import { SubscriptionResponseDTO } from "../../../../dto/subscription/subscription-response.dto.ts";
import { SubscriptionMapper } from "../../../../mappers/subscription.mapper.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";


export class HospitalSubscriptionService implements IHospitalSubscriptionService {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly hospitalRepository: IHospitalRepository,
        private readonly doctorRepository: IDoctorRepository,
        private readonly departmentRepository: IDepartmentRepository,
        private readonly userRepository: IUserRepository,
        private readonly subscriptionMapper: SubscriptionMapper
    ) {}

  async getActiveSubscriptions(page: number,limit: number,search: string): Promise<{ data: SubscriptionResponseDTO[]; total: number }> {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    this.subscriptionRepository.findAllWithPagination(skip, limit, search, "active"),
    this.subscriptionRepository.count(search, "active"),
  ]);

  return {
    data: data.map(s =>
      this.subscriptionMapper.toDTO(s as ISubscription)
    ),
    total,
  };
}

    async checkSubscriptionLimit(hospitalId: string, type: "maxDoctors" | "maxPatients" | "maxDepartments"): Promise<void> {
        const hospital = await this.hospitalRepository.findById(hospitalId);
        if (!hospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Hospital not found");
        }
        const subscription = hospital.subscription;
        console.log(type)
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
     
        console.log(planDetails)
    }

 async protection(hospitalId: string): Promise<boolean> {
  const hospital = await this.hospitalRepository.findById(hospitalId);

  if (!hospital) {
    ApiResponse.throwError(404, "Hospital not found");
  }

  const subscription = hospital.subscription;

  if (!subscription) return false;

  if (!subscription.endDate) return false;

  const now = new Date();
  const endDate = new Date(subscription.endDate);

  if (subscription.status !== "active") return false;

  if (now > endDate) return false;

  return true;
}

}
