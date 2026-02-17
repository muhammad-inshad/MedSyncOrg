export class SuperadminkycService {
    constructor(repo) {
        this.repo = repo;
    }
    async hospitals(options) {
        const { page, limit, search, filter } = options;
        console.log(search, "----------------");
        return await this.repo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["hospitalName", "email"],
            filter
        });
    }
    async updateHospitalStatus(id, status, reason) {
        const updateData = {
            reviewStatus: status,
            isActive: status === 'approved',
        };
        if (reason) {
            updateData.rejectionReason = reason;
        }
        return await this.repo.update(id, updateData);
    }
    async updateHospitalStatusReapply(id) {
        return await this.repo.update(id, {
            reviewStatus: 'pending',
            rejectionReason: null
        });
    }
}
