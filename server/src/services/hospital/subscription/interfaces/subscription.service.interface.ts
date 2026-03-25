import { SubscriptionResponseDTO } from "../../../../dto/subscription/subscription-response.dto.ts";

export interface IHospitalSubscriptionService {
    getActiveSubscriptions(page: number, limit: number, search: string): Promise<{ data: SubscriptionResponseDTO[]; total: number }>;
    checkSubscriptionLimit(hospitalId: string, type: "maxDoctors" | "maxPatients" | "maxDepartments"): Promise<void>;
    protection(hospitalId: string): Promise<boolean>;
}
