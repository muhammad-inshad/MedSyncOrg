import { ISalaryRequest } from "../../../../models/SalaryRequest.model.js";

export interface IDoctorSalaryService {
    getDoctorSalaryRequests(
        hospital_id: string,
        page?: number,
        limit?: number,
        search?: string,
        status?: string
    ): Promise<{ data: ISalaryRequest[]; total: number; totalPages: number }>;

    updateSalaryRequestStatus(
        id: string,
            hospital_id: string,
        status: "APPROVED" | "REJECTED",
        data: { approvedAmount?: number; note: string, hospitalCommission?: number, doctorId?: string }
    ): Promise<ISalaryRequest | null>;
}