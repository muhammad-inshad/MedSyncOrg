import { MESSAGES } from "../../../constants/messages.js";
import { ApiResponse } from "../../../utils/apiResponse.utils.js";
export class DoctorAuthController {
    constructor(_doctorAuthService) {
        this._doctorAuthService = _doctorAuthService;
        this.registerDoctor = async (req, res, next) => {
            try {
                const files = req.files;
                const doctorData = req.body;
                const doctor = await this._doctorAuthService.registerDoctor(doctorData, files);
                return ApiResponse.created(res, MESSAGES.DOCTOR.REGISTER_SUCCESS, doctor);
            }
            catch (error) {
                next(error);
            }
        };
        this.loginDoctor = async (req, res, next) => {
            try {
                const loginData = req.body;
                const result = await this._doctorAuthService.loginDoctor(loginData);
                res.cookie("refreshToken", result.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1000,
                    path: "/",
                });
                res.cookie("accessToken", result.accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1000,
                    path: "/",
                });
                return ApiResponse.success(res, MESSAGES.DOCTOR.LOGIN_SUCCESS, {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    user: {
                        ...result.user,
                        role: "doctor"
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.selectHospitals = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                const search = req.query.search || "";
                const result = await this._doctorAuthService.getAvailableHospitals(page, limit, search);
                return ApiResponse.success(res, "Hospitals fetched successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getHospitalDepartments = async (req, res, next) => {
            try {
                const { hospitalId } = req.params;
                const result = await this._doctorAuthService.getHospitalDepartments(hospitalId);
                return ApiResponse.success(res, "Departments fetched successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getHospitalQualifications = async (req, res, next) => {
            try {
                const { hospitalId } = req.params;
                const result = await this._doctorAuthService.getHospitalQualifications(hospitalId);
                return ApiResponse.success(res, "Qualifications fetched successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getHospitalSpecializations = async (req, res, next) => {
            try {
                const { hospitalId } = req.params;
                const { departmentId } = req.query;
                const result = await this._doctorAuthService.getHospitalSpecializations(hospitalId, departmentId);
                return ApiResponse.success(res, "Specializations fetched successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
