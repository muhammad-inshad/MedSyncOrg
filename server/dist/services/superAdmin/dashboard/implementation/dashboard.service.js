import { Types } from "mongoose";
export class SuperAdminDashboardService {
    constructor(superAdminRepo, kycRepo, doctorRepo, patientRepo, _walletRepo) {
        this.superAdminRepo = superAdminRepo;
        this.kycRepo = kycRepo;
        this.doctorRepo = doctorRepo;
        this.patientRepo = patientRepo;
        this._walletRepo = _walletRepo;
    }
    async getDashboardStats() {
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
    async getme(id) {
        return await this.superAdminRepo.findById(id);
    }
    async getWallet(superAdminId) {
        let superAdmin = await this._walletRepo.findOne({ ownerId: new Types.ObjectId(superAdminId) });
        if (!superAdmin) {
            superAdmin = await this._walletRepo.create({ ownerId: new Types.ObjectId(superAdminId) });
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
    async withdraw(superAdminId, amount) {
        const wallet = await this._walletRepo.findOne({ ownerId: new Types.ObjectId(superAdminId) });
        if (!wallet) {
            return { success: false, message: "Wallet not found" };
        }
        if (wallet.balance < amount) {
            return { success: false, message: "Insufficient balance" };
        }
        wallet.balance -= amount;
        wallet.Transaction = wallet.Transaction || [];
        wallet.Transaction.push({
            amount,
            type: 'debit',
            date: new Date(),
        });
        await this._walletRepo.update(wallet._id.toString(), wallet);
        return { success: true, message: "Withdrawal successful" };
    }
}
