import { ApiResponse } from "../../../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../../../constants/enums.js";
export class SuperAdminDashboardController {
    constructor(service) {
        this.service = service;
        this.getDashboardStats = async (req, res, next) => {
            try {
                const stats = await this.service.getDashboardStats();
                ApiResponse.success(res, "Dashboard stats fetched successfully", stats);
            }
            catch (error) {
                next(error);
            }
        };
        this.getme = async (req, res, next) => {
            try {
                const user = req.user;
                const superAdminId = user?.userId;
                if (!superAdminId) {
                    ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
                    return;
                }
                const superAdmin = await this.service.getme(superAdminId);
                ApiResponse.success(res, "Super admin details fetched successfully", superAdmin);
            }
            catch (error) {
                next(error);
            }
        };
        this.getWallet = async (req, res, next) => {
            try {
                const user = req.user;
                const superAdminId = user?.userId;
                if (!superAdminId) {
                    ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
                    return;
                }
                const walletData = await this.service.getWallet(superAdminId);
                ApiResponse.success(res, "Wallet data fetched successfully", walletData);
            }
            catch (error) {
                next(error);
            }
        };
        this.withdraw = async (req, res, next) => {
            try {
                const { amount } = req.body;
                const user = req.user;
                const superAdminId = user?.userId;
                if (!superAdminId) {
                    ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
                    return;
                }
                const result = await this.service.withdraw(superAdminId, amount);
                ApiResponse.success(res, "Withdrawal successful", result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
