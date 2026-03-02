import { ISuperAdmin } from "../../../../models/superAdmin.model.ts";

export interface IDashboardStats {
    totalHospitals: number;
    activeHospitals: number;
    totalDoctors: number;
    activeDoctors: number;
    totalPatients: number;
}

export interface ISuperAdminDashboardService {
    getDashboardStats(): Promise<IDashboardStats>;
    getme(id: string): Promise<ISuperAdmin | null>;
}
