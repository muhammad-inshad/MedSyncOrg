import bcrypt from "bcryptjs";
import type { Request } from "express";
import { SuperAdminRepository } from "../repositories/superAdmin/superAdmin.repository.ts";
import { TokenService } from "./token.service.ts";
import { KycRepository } from "../repositories/superAdminKyc.repository.ts";

export class SuperAdminService {
    constructor(
        private readonly repo: SuperAdminRepository,
        private readonly tokenService: TokenService,
        private readonly kycRepo: KycRepository
    ) { }

 

    async hospitalManagement(options: { page: number; limit: number; search?: string }) {
        const { page, limit, search } = options;
        return await this.kycRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["hospitalName", "email", "_id"],
            filter: { reviewStatus: 'approved' }
        });
    }

    async getme(id: string) {
        return await this.repo.findById(id)
    }

    async setActive(id: string, isActive: boolean) {
        try {
            console.log('Updating hospital:', { id, isActive });
            const updatedHospital = await this.kycRepo.update(id, { isActive } as any);
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
        } catch (error: any) {
            console.error('Error updating hospital:', error);
            throw { 
                status: error.status || 500, 
                message: error.message || "Failed to update hospital status" 
            };
        }
    }
}