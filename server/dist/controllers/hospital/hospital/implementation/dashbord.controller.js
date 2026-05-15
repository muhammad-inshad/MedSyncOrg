import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { MESSAGES } from "../../../../constants/messages.js";
export class Dashbord {
    constructor(_dashbord) {
        this._dashbord = _dashbord;
        this.getDoctorStatus = async (req, res, next) => {
            try {
                const hospitalId = req.user?.userId;
                if (!hospitalId) {
                    ApiResponse.unauthorized(res, "Hospital ID not found in token");
                    return;
                }
                const status = await this._dashbord.getDoctorStatus(hospitalId);
                ApiResponse.success(res, "Doctor status fetched successfully", status);
            }
            catch (error) {
                next(error);
            }
        };
        this.getKycStats = async (req, res, next) => {
            try {
                const hospitalId = req.user?.userId;
                if (!hospitalId) {
                    ApiResponse.unauthorized(res, "Hospital ID not found in token");
                    return;
                }
                const kycStats = await this._dashbord.getKycStats(hospitalId);
                ApiResponse.success(res, "KYC stats fetched successfully", kycStats);
            }
            catch (error) {
                next(error);
            }
        };
        this.getCommonStats = async (req, res, next) => {
            try {
                const hospitalId = req.user?.userId;
                const type = req.query.type;
                if (!hospitalId) {
                    ApiResponse.unauthorized(res, "Hospital ID not found in token");
                    return;
                }
                const stats = await this._dashbord.getCommonStats(hospitalId, type);
                ApiResponse.success(res, "Common stats fetched successfully", { stats });
            }
            catch (error) {
                next(error);
            }
        };
        this.getWallet = async (req, res, next) => {
            try {
                const hospitalId = req.user?.userId;
                if (!hospitalId) {
                    ApiResponse.unauthorized(res, "Hospital ID not found in token");
                    return;
                }
                const wallet = await this._dashbord.getWallet(hospitalId);
                ApiResponse.success(res, "Wallet details fetched successfully", wallet);
            }
            catch (error) {
                next(error);
            }
        };
        this.withdraw = async (req, res, next) => {
            try {
                const hospitalId = req.user?.userId;
                if (!hospitalId) {
                    ApiResponse.unauthorized(res, "Hospital ID not found in token");
                    return;
                }
                const { amount } = req.body;
                const withdrawal = await this._dashbord.withdraw(hospitalId, amount);
                ApiResponse.success(res, "Withdrawal processed successfully", withdrawal);
            }
            catch (error) {
                next(error);
            }
        };
        this.getReqcancalation = async (req, res, next) => {
            try {
                const hospitalId = req.user?.userId;
                if (!hospitalId) {
                    ApiResponse.unauthorized(res, "Hospital ID not found in token");
                    return;
                }
                const result = await this._dashbord.getReqcancalation(hospitalId);
                ApiResponse.success(res, "data featched successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
        this.approvecancellation = async (req, res, next) => {
            try {
                const { id } = req.params;
                const hospitalId = req.user?.userId;
                if (!hospitalId) {
                    ApiResponse.unauthorized(res, "Hospital ID not found in token");
                    return;
                }
                const result = await this._dashbord.approvecancellation(id, hospitalId);
                ApiResponse.success(res, "approve success", result);
            }
            catch (error) {
                next(error);
            }
        };
        this.rejectcancellation = async (req, res, next) => {
            try {
                const { id } = req.params;
                const { reason } = req.body;
                const result = await this._dashbord.rejectcancellation(id, reason);
                ApiResponse.success(res, "success the reject", result);
            }
            catch (error) {
                next(error);
            }
        };
    }
    async getstatus(req, res, next) {
        try {
            const hospitalId = req.user?.userId;
            if (!hospitalId) {
                ApiResponse.unauthorized(res, "Hospital ID not found in token");
                return;
            }
            const stats = await this._dashbord.getDashboardStats(hospitalId);
            ApiResponse.success(res, MESSAGES.DASHBOARD_STATS_FETCHED, stats);
        }
        catch (error) {
            next(error);
        }
    }
}
