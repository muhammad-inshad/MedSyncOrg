import { HospitalResponseDTO } from "../../../../dto/hospital/hospital-response.dto.ts";

export interface IKycHospitalsResult {
    data: HospitalResponseDTO[];
    total: number;
    page: number;
    limit: number;
}

export interface ISuperAdminKycService {
    hospitals(options: { page: number; limit: number; search?: string; filter?: object }): Promise<IKycHospitalsResult>;
}
