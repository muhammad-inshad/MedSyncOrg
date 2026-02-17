import bcrypt from "bcryptjs";
export class SuperAdminService {
    constructor(repo, tokenService, kycRepo) {
        this.repo = repo;
        this.tokenService = tokenService;
        this.kycRepo = kycRepo;
    }
    async login(email, password) {
        const superAdmin = await this.repo.findByEmailWithPassword(email);
        if (!superAdmin) {
            throw { status: 401, message: "Invalid credentials" };
        }
        const isMatch = await bcrypt.compare(password, superAdmin.password);
        if (!isMatch) {
            throw { status: 400, message: "password is not macth" };
        }
        const payload = {
            userId: superAdmin._id.toString(),
            email: superAdmin.email,
            role: "superadmin"
        };
        const accessToken = this.tokenService.generateAccessToken(payload);
        const refreshToken = this.tokenService.generateRefreshToken(payload);
        console.log(accessToken, refreshToken);
        return {
            accessToken,
            refreshToken,
            user: {
                id: superAdmin._id,
                email: superAdmin.email,
                role: "superadmin",
                isActive: superAdmin.isActive,
            },
        };
    }
    async hospitalManagement(options) {
        const { page, limit, search } = options;
        return await this.kycRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["hospitalName", "email", "_id"],
            filter: { reviewStatus: 'approved' }
        });
    }
    async getme(id) {
        return await this.repo.findById(id);
    }
    async setActive(id, isActive) {
        try {
            console.log('Updating hospital:', { id, isActive });
            const updatedHospital = await this.kycRepo.update(id, { isActive });
            console.log('Updated hospital:', updatedHospital);
            if (!updatedHospital) {
                throw { status: 404, message: "Hospital not found" };
            }
            const hospitalObj = updatedHospital.toObject ? updatedHospital.toObject() : updatedHospital;
            const { password, ...safeData } = hospitalObj;
            return {
                ...safeData,
                message: `Hospital successfully ${isActive ? 'activated' : 'deactivated'}`
            };
        }
        catch (error) {
            console.error('Error updating hospital:', error);
            throw {
                status: error.status || 500,
                message: error.message || "Failed to update hospital status"
            };
        }
    }
}
