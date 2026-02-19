import bcrypt from "bcryptjs";
import type { Request } from "express";
import { SuperAdminRepository } from "../repositories/superAdmin/superAdmin.repository.ts";
import { TokenService } from "./token.service.ts";
import { KycRepository } from "../repositories/superAdminKyc.repository.ts";

import { DoctorRepository } from "../repositories/doctor/doctor.repository.ts";
import { UserRepository } from "../repositories/patient/user.repository.ts";

export class SuperAdminService {
    constructor(
        private readonly repo: SuperAdminRepository,
        private readonly tokenService: TokenService,
        private readonly kycRepo: KycRepository,
        private readonly doctorRepo: DoctorRepository,
        private readonly patientRepo: UserRepository
    ) { }



    async getDashboardStats() {
        // Count Hospitals (Admins)
        // Note: BaseRepository doesn't expose countDocuments directly usually, assuming we need to add it or use model access if protected.
        // Checking BaseRepository: it has 'model' as protected. 
        // But Repositories extend BaseRepository.
        // Let's assume repositories might not have count method yet.
        // We can cast to any to access model or add count method to repositories. 
        // For now, I'll access via (repo as any).model.countDocuments() strictly for stats to avoid changing all repo interfaces right now.

        const totalHospitals = await (this.kycRepo as any).model.countDocuments();
        const activeHospitals = await (this.kycRepo as any).model.countDocuments({ isActive: true });

        const totalDoctors = await (this.doctorRepo as any).model.countDocuments();
        const activeDoctors = await (this.doctorRepo as any).model.countDocuments({ isActive: true });

        const totalPatients = await (this.patientRepo as any).model.countDocuments();

        return {
            totalHospitals,
            activeHospitals,
            totalDoctors,
            activeDoctors,
            totalPatients
        };
    }

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