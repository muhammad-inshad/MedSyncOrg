import { KycHospitalResponseDTO } from "../../../../dto/superAdmin/kyc/kyc-hospital-response.dto.js";

export interface IKycHospitalsResult {
    data: KycHospitalResponseDTO[];
    total: number;
    page: number;
    limit: number;
}

export interface ISuperAdminKycService {
    hospitals(options: { page: number; limit: number; search?: string; filter?: object }): Promise<IKycHospitalsResult>;
}
