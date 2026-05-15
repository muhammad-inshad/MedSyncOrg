import { Types } from "mongoose";
import { COMMENT_TYPES } from "../../../../constants/Comments/Comment.js";
import { AppointmentStatus } from "../../../../models/appointment.js";
export class DashbordService {
    constructor(_doctorRepo, _userRepo, _departmentRepo, _specializationRepo, _qualificationRepo, _walletRepo, _appoiments, _appoimentmapper, _hospitaldoctorcnfigRepo) {
        this._doctorRepo = _doctorRepo;
        this._userRepo = _userRepo;
        this._departmentRepo = _departmentRepo;
        this._specializationRepo = _specializationRepo;
        this._qualificationRepo = _qualificationRepo;
        this._walletRepo = _walletRepo;
        this._appoiments = _appoiments;
        this._appoimentmapper = _appoimentmapper;
        this._hospitaldoctorcnfigRepo = _hospitaldoctorcnfigRepo;
        this.getWallet = async (hospitalId) => {
            const wallet = await this._walletRepo.findOne({
                ownerId: new Types.ObjectId(hospitalId),
            });
            if (!wallet) {
                return {
                    balance: 0,
                    totalenrnings: 0,
                    totalwithdrawn: 0,
                    transactions: [],
                };
            }
            return {
                balance: wallet.balance,
                totalenrnings: wallet.totalearnings || 0,
                totalwithdrawn: wallet.totalwithdrawn || 0,
                transactions: (wallet.Transaction || []).map(tx => ({
                    amount: tx.amount,
                    type: tx.type,
                    date: tx.date,
                    description: tx.type === 'credit' ? 'Earning from appointment' : 'Withdrawal',
                })),
            };
        };
        this.withdraw = async (hospitalId, amount) => {
            const wallet = await this._walletRepo.findOne({ ownerId: new Types.ObjectId(hospitalId) });
            if (!wallet) {
                return { success: false, message: "Wallet not found" };
            }
            if (wallet.balance < amount) {
                return { success: false, message: "Insufficient balance" };
            }
            await this._walletRepo.debitWallet(hospitalId, amount);
            return { success: true, message: "Withdrawal successful" };
        };
        this.getReqcancalation = async (hospitalId) => {
            const appointments = await this._appoiments.findByFilter({
                cancelRequest: true, hospitalId: hospitalId
            });
            return appointments.map((appointment) => this._appoimentmapper.toDTO(appointment));
        };
        this.approvecancellation = async (id, hospitalId) => {
            const result = await this._appoiments.update(id, {
                cancelRequest: false,
                status: AppointmentStatus.CANCELLED
            });
            console.log(result);
            const finduser = await this._appoiments.findById(id);
            if (!finduser) {
                return false;
            }
            const patient = finduser.bookedBy;
            const doctor = finduser.doctorId;
            let patientwallet = await this._walletRepo.findOne({
                ownerId: patient,
            });
            if (!patientwallet) {
                patientwallet = await this._walletRepo.create({
                    ownerId: patient,
                });
            }
            const hospitalwallet = await this._walletRepo.findOne({
                ownerId: hospitalId,
            });
            const hospitalbalance = hospitalwallet?.balance ?? 0;
            const hospitalDoctorConfig = await this._hospitaldoctorcnfigRepo.findByFilter({
                hospitalId,
                doctorId: doctor,
            });
            const amount = hospitalDoctorConfig[0]?.doctorFee ?? 0;
            if (amount <= hospitalbalance) {
                await this._walletRepo.debitWallet(hospitalId.toString(), amount);
                await this._walletRepo.creditWallet(patient.toString(), amount);
            }
            return true;
        };
    }
    async getDashboardStats(hospitalId) {
        const totalDoctors = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId) });
        const activeDoctors = await this._doctorRepo.countActiveDoctor(hospitalId);
        const totalPatients = await this._userRepo.countDocuments();
        console.log(totalDoctors, activeDoctors, totalPatients);
        return {
            totalDoctors,
            activeDoctors,
            totalPatients,
        };
    }
    async getDoctorStatus(hospitalId) {
        const total = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId) });
        const active = await this._doctorRepo.countActiveDoctor(hospitalId);
        const blocked = await this._doctorRepo.countBlockedDoctor(hospitalId);
        const pending = await this._doctorRepo.countPendingDoctor(hospitalId);
        return {
            total,
            active,
            blocked,
            pending
        };
    }
    ;
    async getKycStats(hospitalId) {
        const total = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId), reviewStatus: { $in: ['pending', 'rejected', 'revision'] } });
        const pending = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId), reviewStatus: 'pending' });
        const rejected = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId), reviewStatus: 'rejected' });
        const revision = await this._doctorRepo.countDocuments({ hospital_id: new Types.ObjectId(hospitalId), reviewStatus: 'revision' });
        return {
            total,
            pending,
            rejected,
            revision
        };
    }
    async getCommonStats(hospitalId, type) {
        const hospitalObjectId = new Types.ObjectId(hospitalId);
        if (type === COMMENT_TYPES.PATIENT_MANAGEMENT) {
            const total = await this._userRepo.countDocuments({ hospital_id: hospitalObjectId });
            const active = await this._userRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
            const blocked = await this._userRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });
            return { total, active, blocked };
        }
        else if (type === COMMENT_TYPES.DEPARTMENT) {
            const total = await this._departmentRepo.countDocuments({ hospital_id: hospitalObjectId });
            const active = await this._departmentRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
            const blocked = await this._departmentRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });
            return { total, active, blocked };
        }
        else if (type === COMMENT_TYPES.SPECIALIZATION) {
            const total = await this._specializationRepo.countDocuments({ hospital_id: hospitalObjectId });
            const active = await this._specializationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
            const blocked = await this._specializationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });
            return { total, active, blocked };
        }
        else if (type === COMMENT_TYPES.QUALIFICATION) {
            const total = await this._qualificationRepo.countDocuments({ hospital_id: hospitalObjectId });
            const active = await this._qualificationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
            const blocked = await this._qualificationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });
            return { total, active, blocked };
        }
        return { total: 0, active: 0, blocked: 0 };
    }
    async rejectcancellation(id, reason) {
        const result = await this._appoiments.update(id, {
            cancelRequest: false,
            rejectionReason: reason,
            status: AppointmentStatus.REJECTED,
        });
        return !!result;
    }
}
