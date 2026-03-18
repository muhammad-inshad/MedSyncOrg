import { ISuperAdminKycService, IKycHospitalsResult } from "../interfaces/kyc.service.interface.ts";
import { IHospital } from "../../../../models/hospital.model.ts";
import { KycHospitalMapper } from "../../../../mappers/kyc-hospital.mapper.ts";
import { ISuperAdminKYCRepository } from "../../../../repositories/superAdmin/interfaces/superAdminkyc.repository.interface.ts";


export class SuperAdminKycService implements ISuperAdminKycService {
    constructor(
        private readonly kycRepo: ISuperAdminKYCRepository,
        private readonly kycHospitalMapper: KycHospitalMapper
    ) { }

    async hospitals(options: { page: number; limit: number; search?: string; filter?: object }): Promise<IKycHospitalsResult> {
        const { page, limit, search, filter } = options;
        const result = await this.kycRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["hospitalName", "email"],
            filter
        });
        return {
            data: result.data.map(h => this.kycHospitalMapper.toDTO(h as IHospital)),
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }
}
