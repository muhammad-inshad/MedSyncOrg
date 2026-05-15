import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { HttpStatusCode } from "../../constants/enums.js";
import { AppError } from "../../errors/app.error.js";
export class DoctorDashboard {
    constructor(_service) {
        this._service = _service;
        this.SALARY_INCREASE_REQUEST = async (req, res) => {
            try {
                const result = await this._service.salaryincreserequest(req.body);
                return ApiResponse.success(res, "Request successfully added", result, HttpStatusCode.OK);
            }
            catch (error) {
                if (error instanceof AppError) {
                    return ApiResponse.error(res, error.message, error);
                }
                return ApiResponse.error(res, "Failed to request salary hike", error);
            }
        };
        this.GET_SALARY_INCREASE_REQUEST = async (req, res) => {
            try {
                const doctorId = req.query.doctorId;
                if (!doctorId) {
                    throw new AppError("Doctor ID is required", HttpStatusCode.BAD_REQUEST);
                }
                const result = await this._service.getsalaryincreserequest(doctorId);
                return ApiResponse.success(res, "Salary increase request fetched successfully", result, HttpStatusCode.OK);
            }
            catch (error) {
                if (error instanceof AppError) {
                    return ApiResponse.error(res, error.message, error);
                }
                return ApiResponse.error(res, "Failed to fetch salary hike request", error);
            }
        };
        this.GET_WALLET = async (req, res) => {
            try {
                const user = req.user;
                const doctorID = user?.doctorID || user?.userId;
                if (!doctorID) {
                    ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
                }
                const result = await this._service.getwallet(doctorID);
                return ApiResponse.success(res, "Wallet information fetched successfully", result, HttpStatusCode.OK);
            }
            catch (error) {
                console.log(error);
                throw new AppError("Failed to fetch wallet information", HttpStatusCode.INTERNAL_SERVER_ERROR);
            }
        };
        this.WITHDRAW = async (req, res) => {
            try {
                const user = req.user;
                const doctorID = user?.doctorID || user?.userId;
                if (!doctorID) {
                    ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
                }
                const result = await this._service.withdraw(doctorID, req.body.amount);
                return ApiResponse.success(res, "Withdrawal request submitted successfully", result, HttpStatusCode.OK);
            }
            catch (error) {
                console.log(error);
                throw new AppError("Failed to process withdrawal request", HttpStatusCode.INTERNAL_SERVER_ERROR);
            }
        };
    }
}
