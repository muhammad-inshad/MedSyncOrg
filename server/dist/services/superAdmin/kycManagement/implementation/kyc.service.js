export class SuperAdminKycService {
    constructor(kycRepo, kycHospitalMapper) {
        this.kycRepo = kycRepo;
        this.kycHospitalMapper = kycHospitalMapper;
    }
    async hospitals(options) {
        const { page, limit, search, filter } = options;
        const result = await this.kycRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["hospitalName", "email"],
            filter
        });
        return {
            data: result.data.map(h => this.kycHospitalMapper.toDTO(h)),
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }
}
