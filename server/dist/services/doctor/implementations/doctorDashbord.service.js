import { Types } from "mongoose";
import { HttpStatusCode } from "../../../constants/enums.js";
import { AppError } from "../../../errors/app.error.js";
export class DoctorDashboardService {
    constructor(_repository, _doctorRepo, _walletRepo) {
        this._repository = _repository;
        this._doctorRepo = _doctorRepo;
        this._walletRepo = _walletRepo;
    }
    async salaryincreserequest(data) {
        const payload = {
            doctorId: new Types.ObjectId(data.doctorId),
            hospitalId: new Types.ObjectId(data.hospitalId),
            currentAmount: Number(data.currentSalary),
            requestedAmount: Number(data.requestedSalary),
            reason: data.reason,
        };
        const dublicate = await this._repository.findDoctorId(payload.doctorId, payload.hospitalId);
        if (dublicate) {
            throw new AppError("Under review, please wait", HttpStatusCode.CONFLICT);
        }
        const res = await this._repository.create(payload);
        return res !== null;
    }
    async getsalaryincreserequest(doctorId) {
        const result = await this._repository.findLatestByDoctorId(new Types.ObjectId(doctorId));
        return result;
    }
    async getwallet(doctorId) {
        const doctor = await this._walletRepo.findByFilter({
            ownerId: new Types.ObjectId(doctorId)
        });
        if (!doctor || doctor.length === 0) {
            throw new AppError("Doctor not found", HttpStatusCode.NOT_FOUND);
        }
        return {
            balance: doctor[0].balance,
            totalenrnings: doctor[0].totalearnings || 0,
            totalwithdrawn: doctor[0].totalwithdrawn || 0,
            Transaction: (doctor[0].Transaction || []).map(tx => ({
                amount: tx.amount,
                type: tx.type,
                date: tx.date.toISOString(),
            })),
        };
    }
    async withdraw(doctorId, amount) {
        const doctor = await this._walletRepo.findByFilter({
            ownerId: new Types.ObjectId(doctorId)
        });
        if (!doctor || doctor.length === 0) {
            throw new AppError("Doctor not found", HttpStatusCode.NOT_FOUND);
        }
        const wallet = doctor[0];
        if (wallet.balance < amount) {
            throw new AppError("Insufficient balance", HttpStatusCode.BAD_REQUEST);
        }
        wallet.balance -= amount;
        wallet.totalwithdrawn = (wallet.totalwithdrawn || 0) + amount;
        wallet.Transaction = wallet.Transaction || [];
        wallet.Transaction.push({
            amount: amount,
            type: "debit",
            date: new Date()
        });
        await wallet.save();
        return true;
    }
}
