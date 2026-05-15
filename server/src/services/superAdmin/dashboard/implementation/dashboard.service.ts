import { ISuperAdminDashboardService, IDashboardStats } from "../interfaces/dashboard.service.interface.js";
import { ISuperAdmin } from "../../../../models/superAdmin.model.js";
import { ISuperAdminRepository } from "../../../../repositories/superAdmin/interfaces/superAdmin.repository.interface.js";
import { ISuperAdminKYCRepository } from "../../../../repositories/superAdmin/interfaces/superAdminkyc.repository.interface.js";
import { IDoctorRepository } from "../../../../repositories/doctor/doctor.repository.interface.js";
import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.js";
import { IWalletRepository } from "../../../../repositories/wallet/wallet.repository.interface.js";
import { Types } from "mongoose";

export class SuperAdminDashboardService implements ISuperAdminDashboardService {
    constructor(
        private readonly superAdminRepo: ISuperAdminRepository,
        private readonly kycRepo: ISuperAdminKYCRepository,
        private readonly doctorRepo: IDoctorRepository,
        private readonly patientRepo: IUserRepository,
        private readonly _walletRepo: IWalletRepository
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

    async getWallet(superAdminId: string): Promise<{  balance: number;
      totalenrnings: number;
      totalwithdrawn: number;
      transactions: { amount: number; type: 'credit' | 'debit'; date: Date; description: string }[];}> {
        let superAdmin = await this._walletRepo.findOne({ ownerId:new Types.ObjectId(superAdminId) });
        if (!superAdmin) {
            superAdmin = await this._walletRepo.create({ ownerId: new Types.ObjectId(superAdminId)});
        }
       
        return {
    balance: superAdmin.balance,
     totalenrnings: superAdmin.totalearnings || 0,
    totalwithdrawn: superAdmin.totalwithdrawn || 0,
    transactions: (superAdmin.Transaction || []).map(tx => ({
      amount: tx.amount,
      type: tx.type,
      date: tx.date,
      description: tx.type === 'credit' ? 'Earning from appointment' : 'Withdrawal',
    })),
  };
    }   
    
    async withdraw(superAdminId: string, amount: number): Promise<{ success: boolean; message: string }> {
       const wallet = await this._walletRepo.findOne({ ownerId: new Types.ObjectId(superAdminId) });
  if (!wallet) {
    return { success: false, message: "Wallet not found" };
  }
  if (wallet.balance < amount) {
    return { success: false, message: "Insufficient balance" };
  }
  
  wallet.balance -= amount;
  wallet.Transaction = wallet.Transaction || [];
  wallet.Transaction!.push({
    amount,
    type: 'debit' as const,
    date: new Date(),
  });
  
  await this._walletRepo.update(wallet._id.toString(), wallet);
        return { success: true, message: "Withdrawal successful" };
    }   
}
