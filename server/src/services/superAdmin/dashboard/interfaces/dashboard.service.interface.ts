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
    getWallet(superAdminId: string): Promise<{  balance: number;
      totalenrnings: number;
      totalwithdrawn: number;
      transactions: { amount: number; type: 'credit' | 'debit'; date: Date; description: string }[];}>;
    withdraw(superAdminId: string, amount: number): Promise<{    success: boolean;
      message: string;}>; 
}
