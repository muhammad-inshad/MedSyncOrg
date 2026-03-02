import { ISuperAdminDashboardService, IDashboardStats } from "../interfaces/dashboard.service.interface.ts";
import { ISuperAdmin } from "../../../../models/superAdmin.model.ts";
import { ISuperAdminRepository } from "../../../../repositories/superAdmin/interfaces/superAdmin.repository.interface.ts";
import { ISuperAdminKYCRepository } from "../../../../repositories/superAdmin/interfaces/superAdminkyc.repository.interface.ts";
import { IDoctorRepository } from "../../../../repositories/doctor/doctor.repository.interface.ts";
import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.ts";

export class SuperAdminDashboardService implements ISuperAdminDashboardService {
    constructor(
        private readonly superAdminRepo: ISuperAdminRepository,
        private readonly kycRepo: ISuperAdminKYCRepository,
        private readonly doctorRepo: IDoctorRepository,
        private readonly patientRepo: IUserRepository
    ) { }

    async getDashboardStats(): Promise<IDashboardStats> {
        const totalHospitals = await this.kycRepo.countDocuments();
        const activeHospitals = await this.kycRepo.countDocuments({ isActive: true });

        const totalDoctors = await this.doctorRepo.countDocuments();
        const activeDoctors = await this.doctorRepo.countDocuments({ isActive: true });

        const totalPatients = await this.patientRepo.countDocuments();

        return {
            totalHospitals,
            activeHospitals,
            totalDoctors,
            activeDoctors,
            totalPatients
        };
    }

    async getme(id: string): Promise<ISuperAdmin | null> {
        return await this.superAdminRepo.findById(id);
    }
}
