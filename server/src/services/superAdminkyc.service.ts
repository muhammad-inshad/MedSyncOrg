import { KycRepository } from "../repositories/superAdminKyc.repository.ts";

export class SuperadminkycService {
    constructor(private readonly repo: KycRepository) { }

    async hospitals(options: { page: number; limit: number; search?: string; filter?: object }) {
        const { page, limit, search, filter } = options;
        console.log(search, "----------------")
        return await this.repo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["hospitalName", "email"],
            filter
        });
    }

    async updateHospitalStatus(id: string, status: string, reason?: string) {
        const updateData: any = {
            reviewStatus: status,
            isActive: status === 'approved',
        };

        if (reason) {
            updateData.rejectionReason = reason;
        }

        return await this.repo.update(id, updateData);
    }

    async updateHospitalStatusReapply(id: string) {
        return await this.repo.update(id, {
            reviewStatus: 'pending',
            rejectionReason: null
        } as any);
    }
}